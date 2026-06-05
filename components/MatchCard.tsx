'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Match, KOMatch } from '@/types'

interface Props {
  match: Match | KOMatch
  userId: string
  initialHome: number | null
  initialAway: number | null
  isKO?: boolean
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('no-NO', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
}

function isLocked(dateStr: string) {
  return new Date(dateStr) <= new Date()
}

export default function MatchCard({ match, userId, initialHome, initialAway, isKO }: Props) {
  const [home, setHome] = useState<string>(initialHome !== null ? String(initialHome) : '')
  const [away, setAway] = useState<string>(initialAway !== null ? String(initialAway) : '')
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const locked = isLocked(match.date)

  const koMatch = match as KOMatch
  const isKOPending = isKO && (!koMatch.home || !koMatch.away)

  if (isKOPending) {
    return (
      <div className="match-card">
        <div className="match-header">
          <div className="match-meta">{koMatch.round} · {fmtDate(match.date)}</div>
        </div>
        <div className="ko-placeholder">🕐 Lag ikke klare ennå</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6 }}>{koMatch.label}</div>
      </div>
    )
  }

  function handleChange(side: 'home' | 'away', val: string) {
    if (side === 'home') setHome(val)
    else setAway(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      const hVal = side === 'home' ? val : home
      const aVal = side === 'away' ? val : away
      await supabase.from('picks').upsert({
        user_id: userId,
        match_id: match.id,
        home_score: hVal === '' ? null : parseInt(hVal),
        away_score: aVal === '' ? null : parseInt(aVal),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,match_id' })
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    }, 700)
  }

  const homeTeam = isKO ? (koMatch.home ?? '') : (match as Match).home
  const awayTeam = isKO ? (koMatch.away ?? '') : (match as Match).away
  const groupLabel = !isKO ? `Gruppe ${(match as Match).group} · ` : `${koMatch.round} · `

  return (
    <div className="match-card">
      <div className="match-header">
        <div className="match-meta">{groupLabel}{fmtDate(match.date)}</div>
        {locked
          ? <span className="tag tag-locked">🔒 Låst</span>
          : <span className="tag tag-open">Åpen</span>}
      </div>
      <div className="match-teams">
        <div className="team-name home">{homeTeam}</div>
        <div className="score-input">
          <input
            className="score-box" type="number" min={0} max={20}
            value={home} disabled={locked}
            onChange={e => handleChange('home', e.target.value)}
          />
          <span className="score-sep">–</span>
          <input
            className="score-box" type="number" min={0} max={20}
            value={away} disabled={locked}
            onChange={e => handleChange('away', e.target.value)}
          />
        </div>
        <div className="team-name">{awayTeam}</div>
      </div>
      {saved && <div className="saved-badge">✓ Lagret</div>}
    </div>
  )
}
