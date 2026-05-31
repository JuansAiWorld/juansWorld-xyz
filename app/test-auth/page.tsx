import { createClient } from '@/lib/supabase/server'
import { createClientManual } from '@/lib/supabase/server-manual'
import { createClientFromHeaders } from '@/lib/supabase/server-headers'
import { cookies, headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function TestAuthPage() {
  let ssrResult: any = { status: 'checking' }
  let manualResult: any = { status: 'checking' }
  let headersResult: any = { status: 'checking' }
  let cookieNames: string[] = []
  let rawCookieHeader: string | null = null

  try {
    const cookieStore = await cookies()
    cookieNames = cookieStore.getAll().map((c) => c.name)
  } catch (e: any) {
    cookieNames = ['error: ' + e.message]
  }

  try {
    const h = await headers()
    rawCookieHeader = h.get('cookie')
  } catch (e: any) {
    rawCookieHeader = 'error: ' + e.message
  }

  // Test @supabase/ssr
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) ssrResult = { status: 'error', message: error.message }
    else if (data.user)
      ssrResult = {
        status: 'authenticated',
        userId: data.user.id,
        email: data.user.email,
      }
    else ssrResult = { status: 'no user' }
  } catch (err: any) {
    ssrResult = { status: 'exception', message: err?.message || String(err) }
  }

  // Test manual (cookies API)
  try {
    const supabase = await createClientManual()
    const { data, error } = await supabase.auth.getUser()
    if (error) manualResult = { status: 'error', message: error.message }
    else if (data.user)
      manualResult = {
        status: 'authenticated',
        userId: data.user.id,
        email: data.user.email,
      }
    else manualResult = { status: 'no user' }
  } catch (err: any) {
    manualResult = {
      status: 'exception',
      message: err?.message || String(err),
    }
  }

  // Test headers-based
  try {
    const supabase = await createClientFromHeaders()
    const { data, error } = await supabase.auth.getUser()
    if (error) headersResult = { status: 'error', message: error.message }
    else if (data.user)
      headersResult = {
        status: 'authenticated',
        userId: data.user.id,
        email: data.user.email,
      }
    else headersResult = { status: 'no user' }
  } catch (err: any) {
    headersResult = {
      status: 'exception',
      message: err?.message || String(err),
    }
  }

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'monospace',
        background: '#0a0a0a',
        color: '#e5e5e5',
        minHeight: '100vh',
      }}
    >
      <h1>Auth Test — Server Component</h1>

      <h2>cookies().getAll() names:</h2>
      <pre
        style={{
          background: '#141414',
          padding: '1rem',
          borderRadius: '8px',
        }}
      >
        {JSON.stringify(cookieNames, null, 2)}
      </pre>

      <h2>headers().get('cookie'):</h2>
      <pre
        style={{
          background: '#141414',
          padding: '1rem',
          borderRadius: '8px',
          wordBreak: 'break-all',
        }}
      >
        {rawCookieHeader || '(null)'}
      </pre>

      {[
        { label: '@supabase/ssr', result: ssrResult },
        { label: 'Manual (cookies API)', result: manualResult },
        { label: 'Headers-based', result: headersResult },
      ].map(({ label, result }) => (
        <div key={label}>
          <h2>{label}:</h2>
          <pre
            style={{
              background: '#141414',
              padding: '1rem',
              borderRadius: '8px',
              color:
                result.status === 'authenticated' ? '#4ade80' : '#f87171',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ))}
    </div>
  )
}
