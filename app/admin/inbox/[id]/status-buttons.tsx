'use client'

import { useState } from 'react'
import { updateStatus } from '../actions'

const statuses = ['new', 'processing', 'draft_ready', 'responded', 'closed', 'spam'] as const

export function StatusButtons({ caseId, currentStatus }: { caseId: string; currentStatus: string }) {
  const [loading, setLoading] = useState<string | null>(null)

  const handleStatus = async (status: string) => {
    if (status === currentStatus || loading) return
    setLoading(status)
    try {
      await updateStatus(caseId, status)
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
      {statuses.map((status) => {
        const active = status === currentStatus
        return (
          <button
            key={status}
            onClick={() => handleStatus(status)}
            disabled={loading === status || active}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'capitalize',
              cursor: active ? 'default' : 'pointer',
              border: active ? '1px solid #404040' : '1px solid #262626',
              background: active ? '#262626' : 'transparent',
              color: active ? '#fafafa' : '#a3a3a3',
            }}
          >
            {loading === status ? '…' : status}
          </button>
        )
      })}
    </div>
  )
}
