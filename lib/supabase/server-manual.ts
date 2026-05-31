import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

function base64urlDecode(str: string): string {
  // Replace base64url chars with base64 chars
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  // Pad with =
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  )
  return Buffer.from(padded, 'base64').toString('utf-8')
}

/**
 * Manually extract Supabase auth session from chunked cookies.
 * This bypasses @supabase/ssr cookie handling which appears to have
 * issues in Next.js 16 Server Components.
 */
export async function createClientManual() {
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Find the Supabase auth token cookie chunks
  // The cookie name format is: sb-<project-ref>-auth-token.0, .1, etc.
  const authCookiePrefix = 'sb-'
  const authCookieSuffix = '-auth-token'

  // Find the base key (e.g., sb-vuodlbazvnthijzfognm-auth-token)
  let baseKey = ''
  for (const c of allCookies) {
    if (
      c.name.startsWith(authCookiePrefix) &&
      c.name.includes(authCookieSuffix)
    ) {
      const dotIndex = c.name.lastIndexOf('.')
      if (dotIndex > 0) {
        baseKey = c.name.slice(0, dotIndex)
      } else {
        baseKey = c.name
      }
      break
    }
  }

  if (!baseKey) {
    // No auth cookies found
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )
  }

  // Collect all chunks
  const chunks: string[] = []
  for (let i = 0; ; i++) {
    const chunkName = i === 0 ? baseKey : `${baseKey}.${i}`
    const cookie = allCookies.find((c) => c.name === chunkName)
    if (!cookie) {
      if (i === 0) {
        // No chunks at all - might be single cookie without suffix
        break
      }
      // We've collected all chunks
      break
    }
    chunks.push(cookie.value)
  }

  if (chunks.length === 0) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    )
  }

  // Join chunks and decode
  const fullValue = chunks.join('')

  // Remove base64- prefix if present
  const base64Prefix = 'base64-'
  const encodedValue = fullValue.startsWith(base64Prefix)
    ? fullValue.slice(base64Prefix.length)
    : fullValue

  let session: any = null
  try {
    const decoded = base64urlDecode(encodedValue)
    session = JSON.parse(decoded)
  } catch (e) {
    console.error('Failed to decode auth cookie:', e)
  }

  const accessToken = session?.access_token

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: accessToken
        ? {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        : undefined,
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  )
}
