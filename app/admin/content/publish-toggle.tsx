'use client'

import { useTransition } from 'react'
import { togglePublish } from './actions'

export function PublishToggle({
  id,
  currentStatus,
}: {
  id: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()
  const isPublished = currentStatus === 'published'

  const handleClick = () => {
    startTransition(async () => {
      try {
        await togglePublish(id, currentStatus)
        window.location.reload()
      } catch (err: any) {
        alert(err.message || 'Failed to update status')
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      style={{
        padding: '0.375rem 0.625rem',
        background: isPublished ? 'rgba(34,197,94,0.1)' : 'transparent',
        border: isPublished ? '1px solid rgba(34,197,94,0.3)' : '1px solid #404040',
        color: isPublished ? '#22c55e' : '#a3a3a3',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 500,
        cursor: isPending ? 'not-allowed' : 'pointer',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {isPending ? '...' : isPublished ? 'Unpublish' : 'Publish'}
    </button>
  )
}
