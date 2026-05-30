import Link from 'next/link'
import { getCases } from '@/lib/hermes/db'

export const metadata = {
  title: 'Inbox — Admin',
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    new: '#ff6b35',
    processing: '#f0a500',
    draft_ready: '#3b82f6',
    responded: '#22c55e',
    closed: '#525252',
    spam: '#7f1d1d',
  }
  return colors[status] || '#888'
}

function priorityDot(priority: number) {
  if (priority >= 5) return '🔴'
  if (priority >= 4) return '🟠'
  if (priority >= 3) return '🟡'
  return '⚪'
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const statusFilter = params.status as any
  const cases = await getCases(100, statusFilter)

  const statuses = ['new', 'processing', 'draft_ready', 'responded', 'closed', 'spam']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fafafa', margin: 0 }}>Hermes Inbox</h1>
          <p style={{ color: '#a3a3a3', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            {cases.length} case{cases.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <FilterLink label="All" value={undefined} active={!statusFilter} />
        {statuses.map((s) => (
          <FilterLink key={s} label={s} value={s} active={statusFilter === s} />
        ))}
      </div>

      <div style={{ background: '#141414', border: '1px solid #262626', borderRadius: '12px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#a3a3a3', fontWeight: 500 }}>From</th>
              <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#a3a3a3', fontWeight: 500 }}>Subject</th>
              <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#a3a3a3', fontWeight: 500 }}>Intent</th>
              <th style={{ textAlign: 'center', padding: '0.875rem 1rem', color: '#a3a3a3', fontWeight: 500 }}>Pri</th>
              <th style={{ textAlign: 'left', padding: '0.875rem 1rem', color: '#a3a3a3', fontWeight: 500 }}>Status</th>
              <th style={{ textAlign: 'right', padding: '0.875rem 1rem', color: '#a3a3a3', fontWeight: 500 }}>Date</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((c: any) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #1f1f1f' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <Link
                    href={`/admin/inbox/${c.id}`}
                    style={{ color: '#fafafa', textDecoration: 'none', fontWeight: 500 }}
                  >
                    {c.from_address}
                  </Link>
                </td>
                <td style={{ padding: '0.875rem 1rem', maxWidth: '300px' }}>
                  <Link
                    href={`/admin/inbox/${c.id}`}
                    style={{ color: '#d4d4d4', textDecoration: 'none' }}
                  >
                    <span style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.subject}
                    </span>
                  </Link>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#a3a3a3', textTransform: 'capitalize' }}>{c.intent}</td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>{priorityDot(c.priority)}</td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: statusBadge(c.status),
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusBadge(c.status) }} />
                    {c.status}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', color: '#737373', fontSize: '0.8rem' }}>
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cases.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#737373', fontSize: '0.875rem' }}>
            No cases yet. When emails start flowing in, they’ll appear here.
          </div>
        )}
      </div>
    </div>
  )
}

function FilterLink({ label, value, active }: { label: string; value?: string; active: boolean }) {
  const href = value ? `/admin/inbox?status=${value}` : '/admin/inbox'
  return (
    <Link
      href={href}
      style={{
        padding: '0.375rem 0.875rem',
        borderRadius: '6px',
        fontSize: '0.8rem',
        fontWeight: 500,
        textDecoration: 'none',
        textTransform: 'capitalize',
        background: active ? '#262626' : 'transparent',
        color: active ? '#fafafa' : '#a3a3a3',
        border: active ? '1px solid #404040' : '1px solid transparent',
      }}
    >
      {label}
    </Link>
  )
}
