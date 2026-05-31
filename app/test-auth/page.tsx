import { createClient } from '@/lib/supabase/server'
import { createClientManual } from '@/lib/supabase/server-manual'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function TestAuthPage() {
  let ssrResult: any = { status: 'checking' }
  let manualResult: any = { status: 'checking' }
  let cookieNames: string[] = []

  try {
    const cookieStore = await cookies()
    cookieNames = cookieStore.getAll().map((c) => c.name)
  } catch (e: any) {
    cookieNames = ['error: ' + e.message]
  }

  // Test @supabase/ssr approach
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      ssrResult = { status: 'error', message: error.message }
    } else if (data.user) {
      ssrResult = {
        status: 'authenticated',
        userId: data.user.id,
        email: data.user.email,
      }
    } else {
      ssrResult = { status: 'no user' }
    }
  } catch (err: any) {
    ssrResult = {
      status: 'exception',
      message: err?.message || String(err),
      stack: err?.stack?.split('\n').slice(0, 3),
    }
  }

  // Test manual cookie extraction approach
  try {
    const supabase = await createClientManual()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      manualResult = { status: 'error', message: error.message }
    } else if (data.user) {
      manualResult = {
        status: 'authenticated',
        userId: data.user.id,
        email: data.user.email,
      }
    } else {
      manualResult = { status: 'no user' }
    }
  } catch (err: any) {
    manualResult = {
      status: 'exception',
      message: err?.message || String(err),
      stack: err?.stack?.split('\n').slice(0, 3),
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

      <h2>Cookie Names Seen by Server:</h2>
      <pre
        style={{
          background: '#141414',
          padding: '1rem',
          borderRadius: '8px',
        }}
      >
        {JSON.stringify(cookieNames, null, 2)}
      </pre>

      <h2>@supabase/ssr createServerClient:</h2>
      <pre
        style={{
          background: '#141414',
          padding: '1rem',
          borderRadius: '8px',
          color: ssrResult.status === 'authenticated' ? '#4ade80' : '#f87171',
        }}
      >
        {JSON.stringify(ssrResult, null, 2)}
      </pre>

      <h2>Manual Cookie Extraction:</h2>
      <pre
        style={{
          background: '#141414',
          padding: '1rem',
          borderRadius: '8px',
          color:
            manualResult.status === 'authenticated' ? '#4ade80' : '#f87171',
        }}
      >
        {JSON.stringify(manualResult, null, 2)}
      </pre>
    </div>
  )
}
