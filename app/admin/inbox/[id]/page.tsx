import Link from 'next/link'
import { getCaseById, getCaseMessages } from '@/lib/hermes/db'
import { ReplyForm } from './reply-form'
import { StatusButtons } from './status-buttons'

export const metadata = {
  title: 'Case — Admin',
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

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const caseRecord = await getCaseById(id)

  if (!caseRecord) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#737373' }}>
        Case not found.
        <br />
        <Link href="/admin/inbox" style={{ color: '#ff6b35', textDecoration: 'none' }}>← Back to inbox</Link>
      </div>
    )
  }

  const messages = await getCaseMessages(id)

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin/inbox" style={{ color: '#a3a3a3', textDecoration: 'none', fontSize: '0.875rem' }}>
          ← Back to inbox
        </Link>
      </div>

      {/* Header */}
      <div
        style={{
          background: '#141414',
          border: '1px solid #262626',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: statusBadge(caseRecord.status),
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusBadge(caseRecord.status) }} />
              {caseRecord.status}
            </span>
            <span style={{ color: '#737373', fontSize: '0.875rem' }}>
              Priority {caseRecord.priority}/5
            </span>
            <span style={{ color: '#737373', fontSize: '0.875rem', textTransform: 'capitalize' }}>
              {caseRecord.intent}
            </span>
            {caseRecord.sentiment && (
              <span style={{ color: '#737373', fontSize: '0.875rem' }}>
                {caseRecord.sentiment}
              </span>
            )}
          </div>
          <span style={{ color: '#737373', fontSize: '0.8rem' }}>
            {new Date(caseRecord.created_at).toLocaleString()}
          </span>
        </div>

        <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.5rem' }}>
          {caseRecord.subject}
        </h1>

        <div style={{ display: 'flex', gap: '1.5rem', color: '#a3a3a3', fontSize: '0.875rem' }}>
          <span>From: <strong style={{ color: '#d4d4d4' }}>{caseRecord.from_address}</strong></span>
          <span>To: <strong style={{ color: '#d4d4d4' }}>{caseRecord.to_address}</strong></span>
        </div>
      </div>

      {/* Thread */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            style={{
              background: msg.direction === 'inbound' ? '#0a0a0a' : '#141414',
              border: '1px solid #262626',
              borderRadius: '12px',
              padding: '1.25rem',
              borderLeft: msg.direction === 'outbound' ? '3px solid #22c55e' : '3px solid #ff6b35',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: msg.direction === 'outbound' ? '#22c55e' : '#ff6b35',
                }}
              >
                {msg.direction}
              </span>
              <span style={{ color: '#737373', fontSize: '0.8rem' }}>
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
            <pre
              style={{
                color: '#d4d4d4',
                fontSize: '0.875rem',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'inherit',
                margin: 0,
              }}
            >
              {msg.body}
            </pre>
          </div>
        ))}

        {messages.length === 0 && caseRecord.body_text && (
          <div
            style={{
              background: '#0a0a0a',
              border: '1px solid #262626',
              borderRadius: '12px',
              padding: '1.25rem',
              borderLeft: '3px solid #ff6b35',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#ff6b35' }}>
                inbound
              </span>
            </div>
            <pre style={{ color: '#d4d4d4', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', margin: 0 }}>
              {caseRecord.body_text}
            </pre>
          </div>
        )}
      </div>

      {/* Draft Response */}
      {caseRecord.draft_response && (
        <div
          style={{
            background: '#141414',
            border: '1px solid #262626',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.75rem' }}>
            🤖 Hermes Draft
          </h3>
          <pre
            style={{
              color: '#a3a3a3',
              fontSize: '0.875rem',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              margin: 0,
              marginBottom: '1rem',
            }}
          >
            {caseRecord.draft_response}
          </pre>
          <ReplyForm caseId={id} initialBody={caseRecord.draft_response} />
        </div>
      )}

      {/* Manual Reply */}
      {!caseRecord.draft_response && (
        <div
          style={{
            background: '#141414',
            border: '1px solid #262626',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fafafa', marginBottom: '0.75rem' }}>
            Reply
          </h3>
          <ReplyForm caseId={id} />
        </div>
      )}

      {/* Status Actions */}
      <StatusButtons caseId={id} currentStatus={caseRecord.status} />
    </div>
  )
}
