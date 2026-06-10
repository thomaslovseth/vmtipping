'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { KO_MATCHES } from '@/lib/data'
import MatchCard from './MatchCard'

const KO_ROUNDS = ['Runde av 32', 'Runde av 16', 'Kvartfinale', 'Semifinale', 'Bronsefinale', 'FINALE']

export default function Knockout({ userId }: { userId: string }) {
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('picks').select('match_id,pick').eq('user_id', userId).then(({ data }) => {
      const map: Record<string, string> = {}
      data?.forEach(p => { if (p.pick) map[p.match_id] = p.pick })
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
              initialPick={picks[m.id] ?? null}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
