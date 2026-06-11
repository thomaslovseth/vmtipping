'use client'

import { useState } from 'react'

interface Props {
  icon: string
  text: string
  storageKey: string
}

export default function InfoBanner({ icon, text, storageKey }: Props) {
  const [visible, setVisible] = useState(true)

  if (!visible) return null

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,48,135,0.06) 0%, rgba(0,48,135,0.03) 100%)',
      border: '1px solid rgba(0,48,135,0.12)',
      borderLeft: '4px solid var(--navy)',
      borderRadius: 12,
      padding: '12px 16px',
      marginBottom: 20,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      fontSize: '0.85rem',
      color: 'var(--text)',
      lineHeight: 1.5,
    }}>
      <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{text}</span>
      <button
        onClick={() => setVisible(false)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--muted)', fontSize: '1rem', padding: '0 4px',
          flexShrink: 0, lineHeight: 1,
        }}
        aria-label="Lukk"
      >✕</button>
    </div>
  )
}
