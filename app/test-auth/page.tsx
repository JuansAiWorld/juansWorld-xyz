import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function TestAuthPage() {
  let result: any = { status: 'checking' }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error) {
      result = { status: 'error', message: error.message }
    } else if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      result = {
        status: 'authenticated',
        userId: data.user.id,
        email: data.user.email,
        role: profile?.role || 'no profile',
      }
    } else {
      result = { status: 'no user' }
    }
  } catch (err: any) {
    result = { status: 'exception', message: err?.message || String(err), stack: err?.stack }
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>Auth Test</h1>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  )
}
