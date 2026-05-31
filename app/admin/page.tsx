import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  let usersCount = 0
  let error = null

  try {
    const supabase = createAdminClient()
    const { count, error: dbError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
    if (dbError) {
      error = dbError.message
    } else {
      usersCount = count ?? 0
    }
  } catch (err: any) {
    error = err?.message || String(err)
    console.error('Dashboard stats error:', err)
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.25rem' }}>
        Dashboard
      </h1>
      <p style={{ color: '#a3a3a3', marginBottom: '2rem', fontSize: '0.875rem' }}>
        Overview of your site
      </p>

      {error && (
        <div style={{ background: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '12px', padding: '1.5rem', color: '#fca5a5', marginBottom: '2rem' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Users" value={usersCount} />
        <StatCard label="Total Content" value={0} />
        <StatCard label="Published" value={0} />
        <StatCard label="API Keys" value={0} />
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '12px', padding: '1.25rem' }}>
      <p style={{ fontSize: '0.875rem', color: '#a3a3a3', margin: 0, marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#fafafa', margin: 0 }}>{value}</p>
    </div>
  )
}
