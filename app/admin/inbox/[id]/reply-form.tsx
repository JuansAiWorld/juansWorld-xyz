'use client'

import { useState } from 'react'
import { replyToCase } from '../actions'

export function ReplyForm({ caseId, initialBody = '' }: { caseId: string; initialBody?: string }) {
  const [body, setBody] = useState(initialBody)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || loading) return

    setLoading(true)
    try {
      await replyToCase(caseId, body)
      setSent(true)
      setBody('')
    } catch (err: any) {
      alert(err.message || 'Failed to send')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{ padding: '1rem', background: '#0a2a0a', border: '1px solid #1a5c1a', borderRadius: '8px', color: '#22c55e', fontSize: '0.875rem' }}>
        ✅ Reply sent.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write your reply..."
        rows={8}
        style={{
          width: '100%',
          padding: '0.875rem',
          background: '#0a0a0a',
          border: '1px solid #404040',
          borderRadius: '8px',
          color: '#e5e5e5',
          fontSize: '0.875rem',
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
          fontFamily: 'inherit',
          marginBottom: '0.75rem',
        }}
      />
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.625rem 1.25rem',
            background: loading ? '#404040' : '#e5e5e5',
            color: loading ? '#a3a3a3' : '#0a0a0a',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Sending…' : 'Send Reply'}
        </button>
      </div>
    </form>
  )
}
