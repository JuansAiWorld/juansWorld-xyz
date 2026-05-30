import { getStats } from './actions'

export default async function AdminDashboardPage() {
  const stats = await getStats()

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
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Total Content" value={stats.content} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="API Keys" value={stats.apiKeys} />
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
