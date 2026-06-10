'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Match, KOMatch } from '@/types'

interface Props {
  match: Match | KOMatch
  userId: string
  initialPick: string | null
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

export default function MatchCard({ match, userId, initialPick, isKO }: Props) {
  const [pick, setPick] = useState<string | null>(initialPick)
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

  const homeTeam = isKO ? (koMatch.home ?? '') : (match as Match).home
  const awayTeam = isKO ? (koMatch.away ?? '') : (match as Match).away
  const groupLabel = !isKO ? `Gruppe ${(match as Match).group} · ` : `${koMatch.round} · `

  async function handlePick(val: string) {
    if (locked) return
    setPick(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      await supabase.from('picks').upsert({
        user_id: userId,
        match_id: match.id,
        pick: val,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,match_id' })
      setSaved(true)
      setTimeout(() => setSaved(false), 1200)
    }, 300)
  }

  const btnStyle = (val: string) => ({
    flex: 1,
    padding: '10px 0',
    fontWeight: 700,
    fontSize: '0.95rem',
    border: 'none',
    borderRadius: 8,
    cursor: locked ? 'not-allowed' : 'pointer',
    opacity: locked && pick !== val ? 0.4 : 1,
    background: pick === val
      ? val === 'H' ? '#00c853'
        : val === 'U' ? '#FFD700'
        : '#1e90ff'
      : 'var(--mid)',
    color: pick === val ? '#000' : 'var(--muted)',
    border: `1px solid ${pick === val
      ? val === 'H' ? '#00c853'
        : val === 'U' ? '#FFD700'
        : '#1e90ff'
      : 'var(--border)'}`,
    transition: 'all 0.15s',
  } as React.CSSProperties)

  return (
    <div className="match-card">
      <div className="match-header">
        <div className="match-meta">{groupLabel}{fmtDate(match.date)}</div>
        {locked
          ? <span className="tag tag-locked">🔒 Låst</span>
          : <span className="tag tag-open">Åpen</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div className="team-name home" style={{ flex: 1, textAlign: 'right' }}>{homeTeam}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>vs</div>
        <div className="team-name" style={{ flex: 1 }}>{awayTeam}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle('H')} onClick={() => handlePick('H')} disabled={locked}>
          H
        </button>
        {!isKO && (
          <button style={btnStyle('U')} onClick={() => handlePick('U')} disabled={locked}>
            U
          </button>
        )}
        <button style={btnStyle('B')} onClick={() => handlePick('B')} disabled={locked}>
          B
        </button>
      </div>
      {saved && <div className="saved-badge" style={{ marginTop: 6 }}>✓ Lagret</div>}
    </div>
  )
}
