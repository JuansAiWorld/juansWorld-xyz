'use client'

import { useEffect } from 'react'

export default function LogoutPage() {
  useEffect(() => {
    // Clear all Supabase auth cookies
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name] = cookie.split('=')
      const trimmed = name.trim()
      if (trimmed.startsWith('sb-')) {
        document.cookie = `${trimmed}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    }
    // Clear localStorage
    localStorage.clear()
    // Redirect to login
    window.location.href = '/login'
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#737373',
        fontSize: '0.875rem',
      }}
    >
      Signing out...
    </div>
  )
}
