'use client'

import { useState } from 'react'
import { createUser } from './actions'

export function AddUserButton() {
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await createUser(formData)
      setSuccess('User created successfully')
      setShowForm(false)
      // Reload to show new user
      setTimeout(() => window.location.reload(), 800)
    } catch (err: any) {
      setError(err.message || 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        style={{
          padding: '0.5rem 1rem',
          background: '#e5e5e5',
          color: '#0a0a0a',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        + Add User
      </button>
    )
  }

  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #262626',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
      }}
    >
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: '#fafafa',
          marginBottom: '1rem',
        }}
      >
        Add New User
      </h3>

      {error && (
        <div
          style={{
            background: '#450a0a',
            border: '1px solid #7f1d1d',
            borderRadius: '8px',
            padding: '0.75rem',
            color: '#fca5a5',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          style={{
            background: '#0a2a0a',
            border: '1px solid #1a5c1a',
            borderRadius: '8px',
            padding: '0.75rem',
            color: '#22c55e',
            fontSize: '0.875rem',
            marginBottom: '1rem',
          }}
        >
          {success}
        </div>
      )}

      <form action={handleSubmit}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '1rem',
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
              Email *
            </label>
            <input
              type="email"
              name="email"
              required
              placeholder="user@example.com"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: '#0a0a0a',
                border: '1px solid #404040',
                borderRadius: '6px',
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
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="Min 6 characters"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: '#0a0a0a',
                border: '1px solid #404040',
                borderRadius: '6px',
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
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="John Doe"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: '#0a0a0a',
                border: '1px solid #404040',
                borderRadius: '6px',
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
              Role
            </label>
            <select
              name="role"
              defaultValue="user"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                background: '#0a0a0a',
                border: '1px solid #404040',
                borderRadius: '6px',
                color: '#e5e5e5',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: loading ? '#404040' : '#e5e5e5',
              color: loading ? '#a3a3a3' : '#0a0a0a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid #404040',
              color: '#a3a3a3',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
