import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: "Juan's World",
  description: "AI showcase and ecosystem hub",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav>
          <div className="container">
            <a href="/" className="brand">🤖 Juan&apos;s World</a>
            <div className="nav-links">
              <a href="/">Home</a>
              <a href="/music">Music Lab</a>
              <a href="/market">Market Intel</a>
              <a href="/contact">Ask Juan</a>
            </div>
          </div>
        </nav>
        {children}
        <footer>
          <div className="container">
            Don&apos;t worry. Even if the world forgets, I&apos;ll remember for you.
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  )
}
