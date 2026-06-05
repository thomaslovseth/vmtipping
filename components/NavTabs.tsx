// components/NavTabs.tsx
'use client'
import type { Tab } from '@/app/page'

interface Props { activeTab: Tab; setActiveTab: (t: Tab) => void; isAdmin: boolean }

const TABS: { id: Tab; label: string }[] = [
  { id: 'gruppespill', label: '🏟️ Gruppespill' },
  { id: 'sluttspill',  label: '🏆 Sluttspill' },
  { id: 'spesialer',  label: '⭐ Spesialer' },
  { id: 'poengtavle', label: '📊 Poengtavle' },
]

export default function NavTabs({ activeTab, setActiveTab, isAdmin }: Props) {
  const tabs = isAdmin ? [...TABS, { id: 'admin' as Tab, label: '⚙️ Admin' }] : TABS
  return (
    <div className="nav-tabs">
      {tabs.map(t => (
        <div
          key={t.id}
          className={`nav-tab${activeTab === t.id ? ' active' : ''}`}
          onClick={() => setActiveTab(t.id)}
        >
          {t.label}
        </div>
      ))}
    </div>
  )
}
