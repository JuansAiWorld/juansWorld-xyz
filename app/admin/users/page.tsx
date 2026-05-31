import { createAdminClient } from '@/lib/supabase/admin'
import { UserActions } from './user-actions'
import { DeleteButton } from './delete-button'
import { AddUserButton } from './add-user-form'

export const dynamic = 'force-dynamic'

async function getUsersDirect() {
  const supabase = createAdminClient()

  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (profilesError) throw profilesError

  const { data: authUsers, error: authError } =
    await supabase.auth.admin.listUsers()

  if (authError) throw authError

  const users = (profiles || []).map((p: Record<string, unknown>) => {
    const authUser = authUsers.users.find((u: any) => u.id === p.id)
    return {
      ...p,
      email: authUser?.email ?? '—',
      email_confirmed_at: authUser?.email_confirmed_at ?? null,
    }
  })

  return users
}

export default async function AdminUsersPage() {
  const users = await getUsersDirect()

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
            Users
          </h1>
          <p
            style={{
              color: '#a3a3a3',
              marginTop: '0.25rem',
              fontSize: '0.875rem',
            }}
          >
            Manage user accounts and roles
          </p>
        </div>
        <AddUserButton />
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
                User
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '0.875rem 1rem',
                  color: '#a3a3a3',
                  fontWeight: 500,
                }}
              >
                Role
              </th>
              <th
                style={{
                  textAlign: 'left',
                  padding: '0.875rem 1rem',
                  color: '#a3a3a3',
                  fontWeight: 500,
                }}
              >
                Joined
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
            {users.map((user: any) => (
              <tr
                key={user.id}
                style={{ borderBottom: '1px solid #1f1f1f' }}
              >
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: '#262626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#d4d4d4',
                      }}
                    >
                      {(
                        user.full_name?.[0] ??
                        user.username?.[0] ??
                        '?'
                      ).toUpperCase()}
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontWeight: 500,
                          color: '#fafafa',
                        }}
                      >
                        {user.full_name ?? user.username ?? 'Unknown'}
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.75rem',
                          color: '#737373',
                        }}
                      >
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <UserActions
                    userId={user.id}
                    currentRole={user.role}
                  />
                </td>
                <td
                  style={{ padding: '0.875rem 1rem', color: '#a3a3a3' }}
                >
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td
                  style={{
                    padding: '0.875rem 1rem',
                    textAlign: 'right',
                  }}
                >
                  <DeleteButton userId={user.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div
            style={{
              padding: '3rem',
              textAlign: 'center',
              color: '#737373',
              fontSize: '0.875rem',
            }}
          >
            No users found
          </div>
        )}
      </div>
    </div>
  )
}
