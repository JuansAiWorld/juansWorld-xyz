'use client'

import { useState } from 'react'

function markdownToHtml(md: string): string {
  if (!md) return ''
  return md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#1f1f1f;padding:0.125rem 0.375rem;border-radius:4px;font-family:monospace;font-size:0.85em;">$1</code>')
    .replace(/```([\s\S]*?)```/g, '<pre style="background:#0f0f0f;padding:1rem;border-radius:8px;overflow:auto;font-family:monospace;font-size:0.85em;line-height:1.5;"><code>$1</code></pre>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#ff6b35;text-decoration:none;">$1</a>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul style="padding-left:1.5rem;margin:0.5rem 0;">$1</ul>')
    .replace(/\n/g, '<br>')
}

export function ComposeForm({
  item,
  saveAction,
}: {
  item: any
  saveAction: (formData: FormData) => Promise<void>
}) {
  const [body, setBody] = useState(item?.body || '')
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (formData: FormData) => {
    setError('')
    setSaving(true)
    try {
      await saveAction(formData)
    } catch (err: any) {
      setSaving(false)
      setError(err.message || 'Failed to save')
    }
  }

  return (
    <form action={handleSubmit}>
      {item?.id && <input type="hidden" name="id" value={item.id} />}

      {error && (
        <div
          style={{
            background: '#450a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '8px',
            padding: '0.75rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#a3a3a3',
              marginBottom: '0.375rem',
            }}
          >
            Title *
          </label>
          <input
            type="text"
            name="title"
            defaultValue={item?.title || ''}
            required
            placeholder="Article title"
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              background: '#0a0a0a',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#e5e5e5',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#a3a3a3',
              marginBottom: '0.375rem',
            }}
          >
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            defaultValue={item?.slug || ''}
            required
            placeholder="article-slug"
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              background: '#0a0a0a',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#e5e5e5',
              fontSize: '0.875rem',
              outline: 'none',
            }}
          />
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#a3a3a3',
              marginBottom: '0.375rem',
            }}
          >
            Type
          </label>
          <select
            name="type"
            defaultValue={item?.type || 'post'}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              background: '#0a0a0a',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#e5e5e5',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <option value="post">Post</option>
            <option value="brief">Brief</option>
            <option value="update">Update</option>
            <option value="note">Note</option>
            <option value="page">Page</option>
            <option value="report">Report</option>
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.875rem',
              color: '#a3a3a3',
              marginBottom: '0.375rem',
            }}
          >
            Language
          </label>
          <select
            name="lang"
            defaultValue={item?.lang || 'en'}
            style={{
              width: '100%',
              padding: '0.625rem 0.875rem',
              background: '#0a0a0a',
              border: '1px solid #404040',
              borderRadius: '8px',
              color: '#e5e5e5',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="ja">Japanese</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label
          style={{
            display: 'block',
            fontSize: '0.875rem',
            color: '#a3a3a3',
            marginBottom: '0.375rem',
          }}
        >
          Excerpt
        </label>
        <input
          type="text"
          name="excerpt"
          defaultValue={item?.excerpt || ''}
          placeholder="Short description (optional)"
          style={{
            width: '100%',
            padding: '0.625rem 0.875rem',
            background: '#0a0a0a',
            border: '1px solid #404040',
            borderRadius: '8px',
            color: '#e5e5e5',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '0.75rem',
          alignItems: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => setPreview(false)}
          style={{
            padding: '0.375rem 0.75rem',
            background: !preview ? '#262626' : 'transparent',
            border: '1px solid #404040',
            color: !preview ? '#fafafa' : '#737373',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          style={{
            padding: '0.375rem 0.75rem',
            background: preview ? '#262626' : 'transparent',
            border: '1px solid #404040',
            color: preview ? '#fafafa' : '#737373',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Preview
        </button>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '0.75rem',
            color: '#737373',
          }}
        >
          Markdown supported
        </span>
      </div>

      {preview ? (
        <div
          style={{
            background: '#0a0a0a',
            border: '1px solid #262626',
            borderRadius: '8px',
            padding: '1.5rem',
            minHeight: '400px',
            maxHeight: '600px',
            overflow: 'auto',
            color: '#d4d4d4',
            fontSize: '0.875rem',
            lineHeight: 1.7,
          }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(body) }}
        />
      ) : (
        <textarea
          name="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="# Your article\n\nWrite in markdown..."
          style={{
            width: '100%',
            minHeight: '400px',
            maxHeight: '600px',
            padding: '1rem',
            background: '#0a0a0a',
            border: '1px solid #262626',
            borderRadius: '8px',
            color: '#e5e5e5',
            fontSize: '0.875rem',
            lineHeight: 1.7,
            fontFamily: 'monospace',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '1.5rem',
          alignItems: 'center',
        }}
      >
        <button
          type="submit"
          name="status"
          value="draft"
          disabled={saving}
          style={{
            padding: '0.625rem 1.25rem',
            background: 'transparent',
            border: '1px solid #404040',
            color: '#a3a3a3',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Saving...' : 'Save Draft'}
        </button>

        <button
          type="submit"
          name="status"
          value="published"
          disabled={saving}
          style={{
            padding: '0.625rem 1.25rem',
            background: saving ? '#404040' : '#e5e5e5',
            color: saving ? '#a3a3a3' : '#0a0a0a',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </form>
  )
}
