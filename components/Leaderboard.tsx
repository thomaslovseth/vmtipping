'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { calcMatchPoints, calcSpecialPoints } from '@/lib/scoring'
import type { LeaderboardEntry, Pick, Special, MatchResult, SpecialResult } from '@/types'

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { data: users },
        { data: allPicks },
        { data: allSpecials },
        { data: results },
        { data: spResults },
      ] = await Promise.all([
        supabase.from('users').select('id,display_name,username').eq('is_admin', false),
        supabase.from('picks').select('*'),
        supabase.from('specials').select('*'),
        supabase.from('match_results').select('*'),
        supabase.from('special_results').select('*'),
      ])

      const resultsMap: Record<string, MatchResult> = {}
      results?.forEach(r => { resultsMap[r.match_id] = r })

      const spResultsMap: Record<string, SpecialResult> = {}
      spResults?.forEach(s => { spResultsMap[s.special_id] = s })

      const ranked = (users ?? []).map(u => {
        const picksMap: Record<string, Pick> = {}
        allPicks?.filter(p => p.user_id === u.id).forEach(p => { picksMap[p.match_id] = p })

        const specialsMap: Record<string, Special> = {}
        allSpecials?.filter(s => s.user_id === u.id).forEach(s => { specialsMap[s.special_id] = s })

        const pts = calcMatchPoints(picksMap, resultsMap) + calcSpecialPoints(specialsMap, spResultsMap)
        return { display_name: u.display_name, username: u.username, points: pts }
      }).sort((a, b) => b.points - a.points)

      setEntries(ranked)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /><br />Beregner poeng...</div>

  return (
    <div>
      <div className="section-title">📊 Poengtavle</div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 16 }}>
        Eksakt resultat = 3p · Riktig utfall = 1p · Spesialer varierer
      </p>
      {entries.length === 0 && (
        <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '40px 0' }}>
          Ingen deltakere ennå
        </p>
      )}
      {entries.map((e, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''
        const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
        return (
          <div className="lb-row" key={e.username}>
            <div className={`lb-rank ${rankClass}`}>{emoji}</div>
            <div className="lb-name">{e.display_name}</div>
            <div className="lb-pts">
              {e.points} <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>poeng</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
