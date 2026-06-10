'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GROUP_MATCHES, GROUPS } from '@/lib/data'
import MatchCard from './MatchCard'

export default function GroupStage({ userId }: { userId: string }) {
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, { home_score: number; away_score: number }>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('picks').select('match_id,pick').eq('user_id', userId),
      supabase.from('match_results').select('match_id,home_score,away_score'),
    ]).then(([{ data: picksData }, { data: resultsData }]) => {
      const pm: Record<string, string> = {}
      picksData?.forEach(p => { if (p.pick) pm[p.match_id] = p.pick })
      const rm: Record<string, { home_score: number; away_score: number }> = {}
      resultsData?.forEach(r => {
        if (r.home_score !== null && r.away_score !== null) rm[r.match_id] = r
      })
      setPicks(pm)
      setResults(rm)
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
              initialPick={picks[m.id] ?? null}
              result={results[m.id] ?? null}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
