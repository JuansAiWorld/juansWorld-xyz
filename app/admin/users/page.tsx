import { getUsers, updateUserRole, deleteUser } from '../actions'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const users = await getUsers()

  async function handleRoleChange(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    const role = formData.get('role') as 'user' | 'admin'
    await updateUserRole(userId, role)
    revalidatePath('/admin/users')
  }

  async function handleDelete(formData: FormData) {
    'use server'
    const userId = formData.get('userId') as string
    await deleteUser(userId)
    revalidatePath('/admin/users')
  }

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
          <p style={{ color: '#a3a3a3', marginTop: '0.25rem', fontSize: '0.875rem' }}>
            Manage user accounts and roles
          </p>
        </div>
      </div>

      <div
        style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                      {(user.full_name?.[0] ?? user.username?.[0] ?? '?').toUpperCase()}
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
                  <form action={handleRoleChange}>
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="role"
                      defaultValue={user.role}
                      onChange={(e) => e.target.form?.requestSubmit()}
                      style={{
                        background: '#0a0a0a',
                        border: '1px solid #404040',
                        borderRadius: '6px',
                        color: '#e5e5e5',
                        padding: '0.375rem 0.625rem',
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </form>
                </td>
                <td style={{ padding: '0.875rem 1rem', color: '#a3a3a3' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  <form action={handleDelete}>
                    <input type="hidden" name="userId" value={user.id} />
                    <button
                      type="submit"
                      onClick={(e) => {
                        if (!confirm('Delete this user? This cannot be undone.')) {
                          e.preventDefault()
                        }
                      }}
                      style={{
                        background: 'transparent',
                        border: '1px solid #7f1d1d',
                        color: '#fca5a5',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#450a0a'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      Delete
                    </button>
                  </form>
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
