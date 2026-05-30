'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    window.location.href = '/admin'
  }

  const handleGithubLogin = async () => {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#e5e5e5',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          padding: '2.5rem',
          background: '#141414',
          borderRadius: '12px',
          border: '1px solid #262626',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: '#fafafa',
          }}
        >
          Admin Login
        </h1>
        <p style={{ color: '#a3a3a3', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Sign in to manage Juan&apos;s World
        </p>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              background: '#450a0a',
              border: '1px solid #7f1d1d',
              borderRadius: '8px',
              color: '#fca5a5',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                marginBottom: '0.375rem',
                color: '#d4d4d4',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                background: '#0a0a0a',
                border: '1px solid #404040',
                borderRadius: '8px',
                color: '#e5e5e5',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 500,
                marginBottom: '0.375rem',
                color: '#d4d4d4',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                background: '#0a0a0a',
                border: '1px solid #404040',
                borderRadius: '8px',
                color: '#e5e5e5',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.625rem',
              background: loading ? '#404040' : '#e5e5e5',
              color: loading ? '#a3a3a3' : '#0a0a0a',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '0.5rem',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in with Email'}
          </button>
        </form>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: '1.5rem 0',
            color: '#525252',
            fontSize: '0.75rem',
          }}
        >
          <div style={{ flex: 1, height: '1px', background: '#262626' }} />
          OR
          <div style={{ flex: 1, height: '1px', background: '#262626' }} />
        </div>

        <button
          onClick={handleGithubLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.625rem',
            background: '#171717',
            color: '#e5e5e5',
            border: '1px solid #404040',
            borderRadius: '8px',
            fontSize: '0.875rem',
            fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Sign in with GitHub
        </button>
      </div>
    </div>
  )
}
