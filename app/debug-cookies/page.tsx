import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function DebugCookiesPage() {
  let cookieNames: string[] = []
  let rawCookies: any[] = []
  let error = null

  try {
    const cookieStore = await cookies()
    rawCookies = cookieStore.getAll()
    cookieNames = rawCookies.map((c) => c.name)
  } catch (err: any) {
    error = err?.message || String(err)
  }

  return (
    <div
      style={{
        padding: '2rem',
        fontFamily: 'monospace',
        background: '#0a0a0a',
        color: '#e5e5e5',
        minHeight: '100vh',
      }}
    >
      <h1>Server-Side Cookie Debug</h1>
      {error && (
        <div style={{ color: '#ef4444', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}
      <h2>Cookie Names ({cookieNames.length}):</h2>
      <pre
        style={{
          background: '#141414',
          padding: '1rem',
          borderRadius: '8px',
          overflow: 'auto',
        }}
      >
        {JSON.stringify(cookieNames, null, 2)}
      </pre>
      <h2>Auth Cookie Values (first 100 chars):</h2>
      {rawCookies
        .filter((c) => c.name.includes('sb-') && c.name.includes('auth'))
        .map((c) => (
          <div key={c.name} style={{ marginBottom: '1rem' }}>
            <strong>{c.name}:</strong>
            <pre
              style={{
                background: '#141414',
                padding: '0.5rem',
                borderRadius: '4px',
                wordBreak: 'break-all',
              }}
            >
              {c.value.slice(0, 100)}...
            </pre>
          </div>
        ))}
    </div>
  )
}
