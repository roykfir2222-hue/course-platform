import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Full-Stack Masterclass | Course Platform',
  description: 'Master full-stack development from zero to production. Join 500+ developers.',
  openGraph: {
    title: 'Full-Stack Masterclass',
    description: 'A complete, project-based course covering React, Node.js, and deployment.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body className="bg-zinc-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  )
}
