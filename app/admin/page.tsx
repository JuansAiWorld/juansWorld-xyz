import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

async function getStatsDirect() {
  const supabase = createAdminClient()

  try {
    const [usersRes, contentRes, publishedRes, apiKeysRes] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('content').select('*', { count: 'exact', head: true }),
      supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabase.from('api_keys').select('*', { count: 'exact', head: true }),
    ])

    if (usersRes.error) console.error('getStats users error:', usersRes.error)
    if (contentRes.error)
      console.error('getStats content error:', contentRes.error)
    if (publishedRes.error)
      console.error('getStats published error:', publishedRes.error)
    if (apiKeysRes.error)
      console.error('getStats apiKeys error:', apiKeysRes.error)

    return {
      users: usersRes.count ?? 0,
      content: contentRes.count ?? 0,
      published: publishedRes.count ?? 0,
      apiKeys: apiKeysRes.count ?? 0,
    }
  } catch (err: any) {
    console.error('getStats unexpected error:', err)
    return { users: 0, content: 0, published: 0, apiKeys: 0 }
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStatsDirect()

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
      <p
        style={{
          color: '#a3a3a3',
          marginBottom: '2rem',
          fontSize: '0.875rem',
        }}
      >
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
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
        >
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
      className="quick-link"
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
    >
      {label}
      <span style={{ color: '#737373' }}>→</span>
    </a>
  )
}
