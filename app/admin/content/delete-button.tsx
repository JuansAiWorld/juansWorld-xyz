'use client'

import { useTransition } from 'react'
import { deleteContent } from './actions'

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (!confirm('Delete this article? This cannot be undone.')) return

    startTransition(async () => {
      try {
        await deleteContent(id)
        window.location.reload()
      } catch (err: any) {
        alert(err.message || 'Failed to delete')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        padding: '0.375rem 0.625rem',
        background: 'transparent',
        border: '1px solid #7f1d1d',
        color: '#fca5a5',
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
