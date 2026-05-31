'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [cookies, setCookies] = useState<string[]>([])
  const [localStorageItems, setLocalStorageItems] = useState<Record<string, string>>({})
  const [url, setUrl] = useState('')

  useEffect(() => {
    setUrl(window.location.href)
    setCookies(document.cookie.split(';').map(c => c.trim()).filter(Boolean))
    
    const items: Record<string, string> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        items[key] = localStorage.getItem(key) || ''
      }
    }
    setLocalStorageItems(items)
  }, [])

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace', fontSize: '14px', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>Debug: Auth State</h1>
      <p>URL: {url}</p>
      
      <h2>Cookies ({cookies.length})</h2>
      {cookies.length === 0 ? (
        <p style={{ color: '#ff6b6b' }}>No cookies found!</p>
      ) : (
        <ul>
          {cookies.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}

      <h2>localStorage (Supabase-related)</h2>
      {Object.keys(localStorageItems).length === 0 ? (
        <p style={{ color: '#ff6b6b' }}>No Supabase localStorage items found!</p>
      ) : (
        <ul>
          {Object.entries(localStorageItems).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value.slice(0, 100)}{value.length > 100 ? '...' : ''}
            </li>
          ))}
        </ul>
      )}

      <p style={{ marginTop: '2rem' }}>
        <a href="/admin/login" style={{ color: '#ff6b35' }}>Go to login</a> | {' '}
        <a href="/admin" style={{ color: '#ff6b35' }}>Go to admin</a>
      </p>
    </div>
  )
}
