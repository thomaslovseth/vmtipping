'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import MatchCard from './MatchCard'
import type { KOMatch } from '@/types'

const KO_ROUNDS = ['Runde av 32', 'Runde av 16', 'Kvartfinale', 'Semifinale', 'Bronsefinale', 'FINALE']

export default function Knockout({ userId }: { userId: string }) {
  const [picks, setPicks] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, { home_score: number; away_score: number }>>({})
  const [koMatches, setKoMatches] = useState<KOMatch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('picks').select('match_id,pick').eq('user_id', userId),
      supabase.from('match_results').select('match_id,home_score,away_score'),
      supabase.from('ko_matches').select('*').order('date', { ascending: true }),
    ]).then(([{ data: picksData }, { data: resultsData }, { data: koData }]) => {
      const pm: Record<string, string> = {}
      picksData?.forEach(p => { if (p.pick) pm[p.match_id] = p.pick })

      const rm: Record<string, { home_score: number; away_score: number }> = {}
      resultsData?.forEach(r => {
        if (r.home_score !== null && r.away_score !== null) rm[r.match_id] = r
      })

      // Kombiner Supabase-data med hardkodede KO-kamper som fallback
      const dbMatches: KOMatch[] = (koData ?? []).map(m => ({
        id: m.id,
        round: m.round,
        label: m.label,
        home: m.home ?? null,
        away: m.away ?? null,
        date: m.date,
      }))

      setKoMatches(dbMatches)
      setPicks(pm)
      setResults(rm)
      setLoading(false)
    })
  }, [userId])

  if (loading) return <div className="loading"><div className="spinner" /><br />Laster sluttspill...</div>

  return (
    <div>
      {KO_ROUNDS.map(round => {
        const matches = koMatches.filter(m => m.round === round)

        return (
          <div key={round}>
            <div className="section-title">{round === 'FINALE' ? '🏆' : '⚔️'} {round}</div>
            {matches.length === 0 ? (
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '20px 16px', marginBottom: 10,
                color: 'var(--muted)', fontSize: '0.85rem', fontStyle: 'italic',
                textAlign: 'center'
              }}>
                🕐 Lag ikke klare ennå – oppdateres automatisk
              </div>
            ) : (
              matches.map(m => (
                <MatchCard
                  key={m.id} match={m} userId={userId} isKO
                  initialPick={picks[m.id] ?? null}
                  result={results[m.id] ?? null}
                />
              ))
            )}
          </div>
        )
      })}
    </div>
  )
}
