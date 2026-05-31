import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { headers } from 'next/headers'

function base64urlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '='
  )
  return Buffer.from(padded, 'base64').toString('utf-8')
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      cookies[name] = decodeURIComponent(rest.join('='))
    }
  })
  return cookies
}

/**
 * Create a Supabase client by reading the raw Cookie header.
 * This bypasses the broken cookies() API in Next.js 16 Server Components.
 */
export async function createClientFromHeaders() {
  const h = await headers()
  const cookieHeader = h.get('cookie')

  if (!cookieHeader) {
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

  const cookies = parseCookies(cookieHeader)

  // Find the auth token cookie chunks
  const authCookiePrefix = 'sb-'
  const authCookieSuffix = '-auth-token'

  let baseKey = ''
  for (const name of Object.keys(cookies)) {
    if (name.startsWith(authCookiePrefix) && name.includes(authCookieSuffix)) {
      const dotIndex = name.lastIndexOf('.')
      if (dotIndex > 0) {
        baseKey = name.slice(0, dotIndex)
      } else {
        baseKey = name
      }
      break
    }
  }

  if (!baseKey) {
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

  // Collect chunks
  const chunks: string[] = []
  for (let i = 0; ; i++) {
    const chunkName = i === 0 ? baseKey : `${baseKey}.${i}`
    if (chunkName in cookies) {
      chunks.push(cookies[chunkName])
    } else if (i > 0) {
      break
    }
    if (i > 10) break // safety limit
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

  const fullValue = chunks.join('')
  const base64Prefix = 'base64-'
  const encodedValue = fullValue.startsWith(base64Prefix)
    ? fullValue.slice(base64Prefix.length)
    : fullValue

  let accessToken: string | undefined
  try {
    const decoded = base64urlDecode(encodedValue)
    const session = JSON.parse(decoded)
    accessToken = session?.access_token
  } catch (e) {
    console.error('Failed to decode auth cookie:', e)
  }

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
