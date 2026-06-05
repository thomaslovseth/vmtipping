import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ØRST VM-TIPPING 2026',
  description: 'FIFA World Cup 2026 tipping for Ørst-gjengen',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body>{children}</body>
    </html>
  )
}
