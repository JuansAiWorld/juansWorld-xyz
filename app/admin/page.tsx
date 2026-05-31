export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fafafa', marginBottom: '0.25rem' }}>
        Dashboard (Static)
      </h1>
      <p style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>
        If you see this, the page renders without data fetching.
      </p>
    </div>
  )
}
