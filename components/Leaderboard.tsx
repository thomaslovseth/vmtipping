'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GROUP_MATCHES, KO_MATCHES, SPECIALS } from '@/lib/data'
import type { LeaderboardEntry, SpecialResult } from '@/types'

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
        supabase.from('picks').select('user_id,match_id,pick'),
        supabase.from('specials').select('user_id,special_id,answer'),
        supabase.from('match_results').select('match_id,home_score,away_score'),
        supabase.from('special_results').select('special_id,answer'),
      ])

      const resultsMap: Record<string, { home_score: number | null; away_score: number | null }> = {}
      results?.forEach(r => { resultsMap[r.match_id] = r })

      const spResultsMap: Record<string, SpecialResult> = {}
      spResults?.forEach(s => { spResultsMap[s.special_id] = s })

      const ranked = (users ?? []).map(u => {
        // Picks map for this user
        const picksMap: Record<string, string | null> = {}
        allPicks?.filter(p => p.user_id === u.id).forEach(p => {
          picksMap[p.match_id] = p.pick ?? null
        })

        // Calculate match points
        let pts = 0

        for (const m of GROUP_MATCHES) {
          const pick = picksMap[m.id]
          const result = resultsMap[m.id]
          if (!pick || !result || result.home_score === null || result.away_score === null) continue
          const rh = result.home_score, ra = result.away_score
          const actual = rh > ra ? 'H' : ra > rh ? 'B' : 'U'
          if (pick === actual) pts += 2
        }

        for (const m of KO_MATCHES.filter(m => m.home && m.away)) {
          const pick = picksMap[m.id]
          const result = resultsMap[m.id]
          if (!pick || !result || result.home_score === null || result.away_score === null) continue
          const rh = result.home_score, ra = result.away_score
          const actual = rh > ra ? 'H' : 'B'
          if (pick === actual) pts += 3
        }

        // Special points
        const specialsMap: Record<string, string> = {}
        allSpecials?.filter(s => s.user_id === u.id).forEach(s => {
          specialsMap[s.special_id] = s.answer
        })

        for (const s of SPECIALS) {
          const myAnswer = (specialsMap[s.id] ?? '').toLowerCase().trim()
          const correct = (spResultsMap[s.id]?.answer ?? '').toLowerCase().trim()
          if (myAnswer && correct && myAnswer === correct) pts += s.points
        }

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
        Gruppespill: 2p per riktig H/U/B · Sluttspill: 3p · Spesialer varierer
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
