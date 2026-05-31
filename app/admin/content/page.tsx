import Link from 'next/link'
import { getContentItems, togglePublish, deleteContent } from './actions'
import { PublishToggle } from './publish-toggle'
import { DeleteButton } from './delete-button'

export const dynamic = 'force-dynamic'

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    draft: '#737373',
    published: '#22c55e',
    archived: '#525252',
  }
  return colors[status] || '#888'
}

function typeIcon(type: string) {
  const icons: Record<string, string> = {
    post: '📝',
    brief: '📋',
    update: '📡',
    note: '📌',
    page: '📄',
    report: '📊',
  }
  return icons[type] || '📄'
}

export default async function ContentListPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string }>
}) {
  const params = await searchParams
  const items = await getContentItems(params.type, params.status)

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#fafafa',
              margin: 0,
            }}
          >
            Content
          </h1>
          <p
            style={{
              color: '#a3a3a3',
              marginTop: '0.25rem',
              fontSize: '0.875rem',
            }}
          >
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/compose"
          style={{
            padding: '0.5rem 1rem',
            background: '#e5e5e5',
            color: '#0a0a0a',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          + New Article
        </Link>
      </div>

      <div
        style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #262626' }}>
              <th
                style={{
                  textAlign: 'left',
                  padding: '0.875rem 1rem',
                  color: '#a3a3a3',
                  fontWeight: 500,
                }}
              >
                Article
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '0.875rem 1rem',
                  color: '#a3a3a3',
                  fontWeight: 500,
                }}
              >
                Type
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '0.875rem 1rem',
                  color: '#a3a3a3',
                  fontWeight: 500,
                }}
              >
                Status
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '0.875rem 1rem',
                  color: '#a3a3a3',
                  fontWeight: 500,
                }}
              >
                Updated
              </th>
              <th
                style={{
                  textAlign: 'right',
                  padding: '0.875rem 1rem',
                  color: '#a3a3a3',
                  fontWeight: 500,
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr
                key={item.id}
                style={{ borderBottom: '1px solid #1f1f1f' }}
              >
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 500,
                        color: '#fafafa',
                      }}
                    >
                      {typeIcon(item.type)} {item.title}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.75rem',
                        color: '#737373',
                        marginTop: '0.125rem',
                      }}
                    >
                      /{item.slug}
                    </p>
                  </div>
                </td>
                <td
                  style={{
                    padding: '0.875rem 1rem',
                    color: '#a3a3a3',
                    textTransform: 'capitalize',
                  }}
                >
                  {item.type}
                </td>
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
                      color: statusBadge(item.status),
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: statusBadge(item.status),
                      }}
                    />
                    {item.status}
                  </span>
                </td>
                <td
                  style={{ padding: '0.875rem 1rem', color: '#737373' }}
                >
                  {new Date(item.updated_at).toLocaleDateString()}
                </td>
                <td
                  style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'right',
                    display: 'flex',
                    gap: '0.5rem',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Link
                    href={`/admin/compose?id=${item.id}`}
                    style={{
                      padding: '0.375rem 0.625rem',
                      background: 'transparent',
                      border: '1px solid #404040',
                      color: '#a3a3a3',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </Link>
                  <PublishToggle
                    id={item.id}
                    currentStatus={item.status}
                  />
                  <DeleteButton id={item.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {items.length === 0 && (
          <div
            style={{
              padding: '4rem',
              textAlign: 'center',
              color: '#737373',
              fontSize: '0.875rem',
            }}
          >
            No articles yet.
            <br />
            <Link
              href="/admin/compose"
              style={{ color: '#ff6b35', textDecoration: 'none' }}
            >
              Write your first article →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
