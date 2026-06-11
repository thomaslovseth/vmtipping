// components/TopBar.tsx
'use client'
import type { User } from '@/types'

interface Props { user: User; onLogout: () => void }

export default function TopBar({ user, onLogout }: Props) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span>⚽</span>
        <div>
          <div className="topbar-title">fotballtipping.no</div>
          <div className="topbar-user">{user.display_name}{user.is_admin ? ' 👑' : ''}</div>
        </div>
      </div>
      <button className="logout-btn" onClick={onLogout}>Logg ut</button>
    </div>
  )
}
