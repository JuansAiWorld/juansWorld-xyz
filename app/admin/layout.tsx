import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5' }}>
      <aside style={{ width: '200px', background: '#141414', borderRight: '1px solid #262626', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fafafa', margin: 0 }}>Admin</h2>
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
