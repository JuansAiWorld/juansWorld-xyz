import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  let profile = null
  let authError = null

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error) authError = error.message
    else user = data.user

    if (user) {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      profile = p
    }
  } catch (err: any) {
    authError = err?.message || String(err)
    console.error('Admin layout auth error:', err)
  }

  // Not logged in — render login without sidebar
  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
        {children}
      </div>
    )
  }

  // Logged in but not admin
  if (!profile || profile.role !== 'admin') {
    redirect('/')
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#e5e5e5',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <aside
        style={{
          width: '240px',
          background: '#141414',
          borderRight: '1px solid #262626',
          display: 'flex',
          flexDirection: 'column',
          padding: '1.5rem',
        }}
      >
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#fafafa', margin: 0 }}>
            Juan&apos;s World
          </h2>
          <p style={{ fontSize: '0.75rem', color: '#737373', marginTop: '0.25rem' }}>
            Admin Dashboard
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <NavLink href="/admin" icon="📊">Dashboard</NavLink>
          <NavLink href="/admin/inbox" icon="📬">Inbox</NavLink>
          <NavLink href="/admin/users" icon="👥">Users</NavLink>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid #262626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#262626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600, color: '#d4d4d4' }}>
              {(profile?.full_name?.[0] ?? profile?.username?.[0] ?? 'A').toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#fafafa', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {profile?.full_name ?? profile?.username ?? 'Admin'}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#737373', margin: 0 }}>
                {profile?.role}
              </p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 0.75rem', borderRadius: '8px', color: '#a3a3a3', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.15s' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = '#1f1f1f'; e.currentTarget.style.color = '#fafafa' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a3a3a3' }}
    >
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      {children}
    </Link>
  )
}

function LogoutButton() {
  'use client'
  const handleLogout = async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/admin/login'
  }
  return (
    <button
      onClick={handleLogout}
      style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'transparent', border: '1px solid #404040', borderRadius: '8px', color: '#a3a3a3', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', textAlign: 'left' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#525252'; e.currentTarget.style.color = '#fafafa' }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#404040'; e.currentTarget.style.color = '#a3a3a3' }}
    >
      🚪 Sign out
    </button>
  )
}
