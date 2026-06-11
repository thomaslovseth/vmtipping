import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'fotballtipping.no',
  description: 'Nå: FIFA World Cup 2026',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  )
}
