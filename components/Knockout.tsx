// components/Knockout.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { KO_MATCHES } from '@/lib/data'
import MatchCard from './MatchCard'
import type { Pick } from '@/types'

const KO_ROUNDS = ['Runde av 32', 'Runde av 16', 'Kvartfinale', 'Semifinale', 'Bronsefinale', 'FINALE']

export default function Knockout({ userId }: { userId: string }) {
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

  if (loading) return <div className="loading"><div className="spinner" /><br />Laster...</div>

  return (
    <div>
      {KO_ROUNDS.map(round => (
        <div key={round}>
          <div className="section-title">{round === 'FINALE' ? '🏆' : '⚔️'} {round}</div>
          {KO_MATCHES.filter(m => m.round === round).map(m => (
            <MatchCard
              key={m.id} match={m} userId={userId} isKO
              initialHome={picks[m.id]?.home_score ?? null}
              initialAway={picks[m.id]?.away_score ?? null}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
