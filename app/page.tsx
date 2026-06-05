'use client'

import { useState } from 'react'
import LoginScreen from '@/components/LoginScreen'
import TopBar from '@/components/TopBar'
import NavTabs from '@/components/NavTabs'
import GroupStage from '@/components/GroupStage'
import Knockout from '@/components/Knockout'
import Specials from '@/components/Specials'
import Leaderboard from '@/components/Leaderboard'
import AdminPanel from '@/components/AdminPanel'
import type { User } from '@/types'

export type Tab = 'gruppespill' | 'sluttspill' | 'spesialer' | 'poengtavle' | 'admin'

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('gruppespill')

  if (!user) {
    return <LoginScreen onLogin={setUser} />
  }

  return (
    <div>
      <TopBar user={user} onLogout={() => setUser(null)} />
      <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} isAdmin={user.is_admin} />
      <div className="content">
        {activeTab === 'gruppespill' && <GroupStage userId={user.id} />}
        {activeTab === 'sluttspill' && <Knockout userId={user.id} />}
        {activeTab === 'spesialer' && <Specials userId={user.id} />}
        {activeTab === 'poengtavle' && <Leaderboard />}
        {activeTab === 'admin' && user.is_admin && <AdminPanel />}
      </div>
    </div>
  )
}
