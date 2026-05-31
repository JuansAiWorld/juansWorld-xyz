'use client'

import { useTransition } from 'react'
import { deleteUser } from './actions'

export function DeleteButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('Delete this user? This cannot be undone.')) return

    const formData = new FormData()
    formData.append('userId', userId)

    startTransition(async () => {
      try {
        await deleteUser(formData)
        window.location.reload()
      } catch (err: any) {
        alert(err.message || 'Failed to delete user')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        background: 'transparent',
        border: '1px solid #7f1d1d',
        color: '#fca5a5',
        padding: '0.375rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? '...' : 'Delete'}
    </button>
  )
}
