'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GROUP_MATCHES, KO_MATCHES, SPECIALS } from '@/lib/data'
import type { LeaderboardEntry, SpecialResult } from '@/types'
import InfoBanner from './InfoBanner'

interface ExtendedEntry extends LeaderboardEntry {
  matchPoints: number
  specialPoints: number
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<ExtendedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

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
        const picksMap: Record<string, string | null> = {}
        allPicks?.filter(p => p.user_id === u.id).forEach(p => {
          picksMap[p.match_id] = p.pick ?? null
        })

        let matchPts = 0
        for (const m of GROUP_MATCHES) {
          const pick = picksMap[m.id]
          const result = resultsMap[m.id]
          if (!pick || !result || result.home_score === null || result.away_score === null) continue
          const actual = result.home_score > result.away_score ? 'H' : result.away_score > result.home_score ? 'B' : 'U'
          if (pick === actual) matchPts += 2
        }
        for (const m of KO_MATCHES.filter(m => m.home && m.away)) {
          const pick = picksMap[m.id]
          const result = resultsMap[m.id]
          if (!pick || !result || result.home_score === null || result.away_score === null) continue
          const actual = result.home_score > result.away_score ? 'H' : 'B'
          if (pick === actual) matchPts += 3
        }

        const specialsMap: Record<string, string> = {}
        allSpecials?.filter(s => s.user_id === u.id).forEach(s => {
          specialsMap[s.special_id] = s.answer
        })
        let specialPts = 0
        for (const s of SPECIALS) {
          const myAnswer = (specialsMap[s.id] ?? '').toLowerCase().trim()
          const correct = (spResultsMap[s.id]?.answer ?? '').toLowerCase().trim()
          if (myAnswer && correct && myAnswer === correct) specialPts += s.points
        }

        return {
          display_name: u.display_name,
          username: u.username,
          points: matchPts + specialPts,
          matchPoints: matchPts,
          specialPoints: specialPts,
        }
      }).sort((a, b) => b.points - a.points)

      setEntries(ranked)
      setLastUpdated(new Date().toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' }))
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /><br />Beregner poeng...</div>

  const maxPts = entries[0]?.points ?? 1

  return (
    <div>
      <InfoBanner
        icon="📊"
        text="Poengtavlen oppdateres automatisk etter hver kamp. Gruppespill: 2p for riktig H/U/B. Sluttspill: 3p. Spesialtips gir varierende poeng. Trykk «Vis andres tips» på en ferdigspilt kamp for å se hva alle tippet."
        storageKey="info_poeng"
      />

      <div className="section-title">📊 Poengtavle</div>

      {lastUpdated && (
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 16, textAlign: 'right' }}>
          Oppdatert kl. {lastUpdated}
        </div>
      )}

      {entries.length === 0 && (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '40px 20px', textAlign: 'center',
          color: 'var(--muted)', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 8 }}>🏆</div>
          Ingen deltakere ennå
        </div>
      )}

      {entries.map((e, i) => {
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''
        const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
        const barWidth = maxPts > 0 ? (e.points / maxPts) * 100 : 0

        return (
          <div key={e.username} style={{
            background: i === 0
              ? 'linear-gradient(135deg, #fffdf2 0%, #fff8dc 100%)'
              : 'var(--card)',
            border: `1px solid ${i === 0 ? 'rgba(200,147,10,0.3)' : 'var(--border)'}`,
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 10,
            boxShadow: i === 0 ? '0 4px 16px rgba(200,147,10,0.12)' : 'var(--shadow-sm)',
            transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: e.points > 0 ? 10 : 0 }}>
              <div className={`lb-rank ${rankClass}`}>{emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="lb-name">{e.display_name}</div>
                {e.points > 0 && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2 }}>
                    Kamper: <strong>{e.matchPoints}p</strong>
                    {e.specialPoints > 0 && <> · Spesialer: <strong>{e.specialPoints}p</strong></>}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="lb-pts">{e.points}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 600 }}>POENG</div>
              </div>
            </div>
            {e.points > 0 && (
              <div style={{ height: 5, background: 'var(--light)', borderRadius: 5, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${barWidth}%`,
                  background: i === 0
                    ? 'linear-gradient(90deg, #c8930a, #FFD700)'
                    : i === 1
                      ? 'linear-gradient(90deg, #7a8799, #C0C0C0)'
                      : i === 2
                        ? 'linear-gradient(90deg, #a0632a, #CD7F32)'
                        : 'linear-gradient(90deg, var(--navy), var(--navy2))',
                  borderRadius: 5,
                  transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
                }} />
              </div>
            )}
          </div>
        )
      })}

      <div style={{
        marginTop: 24, padding: '14px 18px',
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>
          📖 Poengmodell
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['⚽', 'Riktig H/U/B i gruppespill', '2p'],
            ['⚔️', 'Riktig H/B i sluttspill', '3p'],
            ['⭐', 'Riktig spesialtips', 'varierer'],
          ].map(([icon, label, pts]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.82rem' }}>
              <span>{icon}</span>
              <span style={{ flex: 1, color: 'var(--muted)' }}>{label}</span>
              <span style={{ fontWeight: 800, color: 'var(--navy)' }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
