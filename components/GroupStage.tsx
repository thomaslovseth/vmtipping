// components/GroupStage.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GROUP_MATCHES, GROUPS } from '@/lib/data'
import MatchCard from './MatchCard'
import type { Pick } from '@/types'

export default function GroupStage({ userId }: { userId: string }) {
  const [picks, setPicks] = useState<Record<string, Pick>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('picks').select('*').eq('user_id', userId).then(({ data }) => {
      const map: Record<string, Pick> = {}
      data?.forEach(p => { map[p.match_id] = p })
      setPicks(map)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div className="loading"><div className="spinner" /><br />Laster kamper...</div>

  return (
    <div>
      {Object.entries(GROUPS).map(([g, teams]) => (
        <div key={g}>
          <div className="section-title">⚽ Gruppe {g} — {teams.join(', ')}</div>
          {GROUP_MATCHES.filter(m => m.group === g).map(m => (
            <MatchCard
              key={m.id} match={m} userId={userId}
              initialHome={picks[m.id]?.home_score ?? null}
              initialAway={picks[m.id]?.away_score ?? null}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
