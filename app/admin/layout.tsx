import Link from 'next/link'
import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let headerError: string | null = null
  let cookieHeader: string | null = null
  let headerType: string = 'unknown'

  try {
    headerType = typeof headers
    const h = headers()
    headerType += ', result: ' + typeof h
    if (h && typeof h.get === 'function') {
      cookieHeader = h.get('cookie')
    } else if (h && typeof h.then === 'function') {
      // It's a promise
      const resolved = await h
      cookieHeader = resolved.get('cookie')
    }
  } catch (err: any) {
    headerError = err?.message || String(err)
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', fontFamily: 'monospace' }}>
      <aside style={{ width: '300px', background: '#141414', borderRight: '1px solid #262626', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fafafa', margin: 0 }}>Admin</h2>
        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#a3a3a3' }}>
          headers type: {headerType}
        </div>
        {headerError && (
          <div style={{ color: '#ef4444', marginTop: '1rem', fontSize: '0.75rem' }}>
            ERROR: {headerError}
          </div>
        )}
        {cookieHeader && (
          <div style={{ color: '#4ade80', marginTop: '1rem', fontSize: '0.75rem', wordBreak: 'break-all' }}>
            Cookie header length: {cookieHeader.length}
          </div>
        )}
        {!headerError && !cookieHeader && (
          <div style={{ color: '#f87171', marginTop: '1rem', fontSize: '0.75rem' }}>
            No cookie header
          </div>
        )}
        <nav style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin" style={{ color: '#a3a3a3', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/admin/inbox" style={{ color: '#a3a3a3', textDecoration: 'none' }}>Inbox</Link>
          <Link href="/admin/users" style={{ color: '#a3a3a3', textDecoration: 'none' }}>Users</Link>
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem' }}>{children}</main>
    </div>
  )
}
