import { getStats } from './actions'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  let stats: { users: number; content: number; published: number; apiKeys: number } | null = null
  let error: string | null = null

  try {
    stats = await getStats()
  } catch (err: any) {
    error = err?.message || String(err)
    console.error('Dashboard stats error:', err)
  }

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <div
          style={{
            background: '#450a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
          }}
        >
          <strong>Error loading stats:</strong>
          <pre style={{ marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#fafafa',
          marginBottom: '0.25rem',
        }}
      >
        Dashboard
      </h1>
      <p style={{ color: '#a3a3a3', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Overview of your site
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <StatCard label="Users" value={stats?.users ?? 0} />
        <StatCard label="Total Content" value={stats?.content ?? 0} />
        <StatCard label="Published" value={stats?.published ?? 0} />
        <StatCard label="API Keys" value={stats?.apiKeys ?? 0} />
      </div>

      <div
        style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: '#fafafa',
            marginBottom: '0.75rem',
          }}
        >
          Quick Links
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <QuickLink href="/admin/users" label="Manage Users" />
          <QuickLink href="/admin/inbox" label="Hermes Inbox" />
          <QuickLink href="/" label="View Site" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #262626',
        borderRadius: '12px',
        padding: '1.25rem',
      }}
    >
      <p
        style={{
          fontSize: '0.875rem',
          color: '#a3a3a3',
          margin: 0,
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: '#fafafa',
          margin: 0,
        }}
      >
        {value}
      </p>
    </div>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.625rem 0.875rem',
        borderRadius: '8px',
        color: '#d4d4d4',
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: 500,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#1f1f1f'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      {label}
      <span style={{ color: '#737373' }}>→</span>
    </a>
  )
}
