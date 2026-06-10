'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Match, KOMatch } from '@/types'

interface Props {
  match: Match | KOMatch
  userId: string
  initialPick: string | null
  isKO?: boolean
  result?: { home_score: number; away_score: number } | null
}

// Flagg-emoji map
const FLAGS: Record<string, string> = {
  'Mexico': '🇲🇽', 'Sør-Korea': '🇰🇷', 'Sør-Afrika': '🇿🇦', 'Tsjekkia': '🇨🇿',
  'Canada': '🇨🇦', 'Qatar': '🇶🇦', 'Sveits': '🇨🇭', 'Bosnia-Hercegovina': '🇧🇦',
  'Brasil': '🇧🇷', 'Marokko': '🇲🇦', 'Haiti': '🇭🇹', 'Skottland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA': '🇺🇸', 'Tyrkia': '🇹🇷', 'Australia': '🇦🇺', 'Paraguay': '🇵🇾',
  'Tyskland': '🇩🇪', 'Elfenbenskysten': '🇨🇮', 'Ecuador': '🇪🇨', 'Curaçao': '🇨🇼',
  'Nederland': '🇳🇱', 'Sverige': '🇸🇪', 'Japan': '🇯🇵', 'Tunisia': '🇹🇳',
  'Belgia': '🇧🇪', 'Egypt': '🇪🇬', 'Iran': '🇮🇷', 'New Zealand': '🇳🇿',
  'Spania': '🇪🇸', 'Uruguay': '🇺🇾', 'Saudi-Arabia': '🇸🇦', 'Kapp Verde': '🇨🇻',
  'Frankrike': '🇫🇷', 'Norge': '🇳🇴', 'Senegal': '🇸🇳', 'Irak': '🇮🇶',
  'Argentina': '🇦🇷', 'Algeria': '🇩🇿', 'Østerrike': '🇦🇹', 'Jordan': '🇯🇴',
  'Portugal': '🇵🇹', 'DR Kongo': '🇨🇩', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Kroatia': '🇭🇷',
  'Colombia': '🇨🇴', 'Uzbekistan': '🇺🇿', 'Ghana': '🇬🇭', 'Panama': '🇵🇦',
}

function fmtDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('no-NO', { day: '2-digit', month: 'short' }) + ' ' +
    d.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit' })
}

function getMatchStatus(dateStr: string): 'upcoming' | 'live' | 'finished' {
  const start = new Date(dateStr)
  const now = new Date()
  const diffMin = (now.getTime() - start.getTime()) / 60000
  if (diffMin < 0) return 'upcoming'
  if (diffMin < 120) return 'live'
  return 'finished'
}

export default function MatchCard({ match, userId, initialPick, isKO, result }: Props) {
  const [pick, setPick] = useState<string | null>(initialPick)
  const [saved, setSaved] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const status = getMatchStatus(match.date)
  const locked = status !== 'upcoming'

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

  // Beregn faktisk utfall fra resultat
  let actualOutcome: string | null = null
  if (result !== null && result !== undefined) {
    const rh = result.home_score, ra = result.away_score
    actualOutcome = rh > ra ? 'H' : ra > rh ? 'B' : 'U'
  }

  // Poeng for denne kampen
  const isCorrect = pick && actualOutcome && pick === actualOutcome
  const matchPoints = isCorrect ? (isKO ? 3 : 2) : 0

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

  const btnStyle = (val: string): React.CSSProperties => {
    const isActive = pick === val
    const isActual = actualOutcome === val
    const color = val === 'H' ? '#00e676' : val === 'U' ? '#FFD700' : '#2979ff'
    let bg = 'var(--mid)'
    let border = 'var(--border)'
    let textColor = 'var(--muted)'

    if (isActive && !actualOutcome) {
      bg = color + '22'; border = color; textColor = color
    } else if (isActual && isActive) {
      bg = color; border = color; textColor = '#000'
    } else if (isActual && !isActive) {
      bg = color + '15'; border = color + '60'; textColor = color
    } else if (isActive && actualOutcome && !isActual) {
      bg = 'rgba(255,23,68,0.1)'; border = 'rgba(255,23,68,0.3)'; textColor = '#ff6b6b'
    }

    return {
      flex: 1, padding: '10px 0', fontWeight: 800,
      fontSize: '0.95rem', borderRadius: 8,
      cursor: locked ? 'default' : 'pointer',
      opacity: locked && !isActive && !isActual ? 0.3 : 1,
      background: bg, color: textColor,
      border: `1px solid ${border}`,
      transition: 'all 0.15s',
      letterSpacing: '1px',
    }
  }

  const cardClass = `match-card${status === 'live' ? ' live-card' : status === 'finished' ? ' finished' : ''}`

  return (
    <div className={cardClass}>
      <div className="match-header">
        <div className="match-meta">{groupLabel}{fmtDate(match.date)}</div>
        {status === 'live' && <span className="tag tag-live">🔴 PÅGÅR</span>}
        {status === 'upcoming' && <span className="tag tag-open">Åpen</span>}
        {status === 'finished' && !result && <span className="tag tag-locked">Ferdig</span>}
        {status === 'finished' && result && <span className="tag" style={{background:'rgba(0,230,118,0.1)',color:'var(--green)',border:'1px solid rgba(0,230,118,0.3)'}}>Ferdig</span>}
      </div>

      <div className="match-teams">
        <div className="team-name home">
          <span>{homeTeam}</span>
          <span className="team-flag">{FLAGS[homeTeam] ?? '🏳️'}</span>
        </div>
        {result ? (
          <div style={{ textAlign: 'center', minWidth: 64 }}>
            <div className="result-score">{result.home_score} – {result.away_score}</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', minWidth: 40, fontSize: '0.75rem', color: 'var(--muted)' }}>vs</div>
        )}
        <div className="team-name">
          <span className="team-flag">{FLAGS[awayTeam] ?? '🏳️'}</span>
          <span>{awayTeam}</span>
        </div>
      </div>

      {/* H/U/B knapper */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnStyle('H')} onClick={() => handlePick('H')} disabled={locked}>H</button>
        {!isKO && (
          <button style={btnStyle('U')} onClick={() => handlePick('U')} disabled={locked}>U</button>
        )}
        <button style={btnStyle('B')} onClick={() => handlePick('B')} disabled={locked}>B</button>
      </div>

      {/* Resultatvisning etter kamp */}
      {result && (
        <div className="result-display">
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
            Ditt tips: <strong style={{ color: pick ? 'var(--text)' : 'var(--muted)' }}>{pick ?? '–'}</strong>
            {' · '}Fasit: <strong style={{ color: 'var(--gold)' }}>{actualOutcome}</strong>
          </div>
          {pick ? (
            <div className={`result-points ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect ? `+${matchPoints}p ✓` : '0p ✗'}
            </div>
          ) : (
            <div className="result-points no-pick">Ikke tippa</div>
          )}
        </div>
      )}

      {saved && <div className="saved-badge">✓ Lagret</div>}
    </div>
  )
}
