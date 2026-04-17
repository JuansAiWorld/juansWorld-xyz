import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Juan's World",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
