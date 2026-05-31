'use client'

import { updateUserRole } from './actions'

export function UserActions({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: string
}) {
  return (
    <form action={updateUserRole}>
      <input type="hidden" name="userId" value={userId} />
      <select
        name="role"
        defaultValue={currentRole}
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
  )
}
