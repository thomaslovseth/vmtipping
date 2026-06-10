'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GROUP_MATCHES, KO_MATCHES, SPECIALS } from '@/lib/data'
import type { SpecialResult } from '@/types'

export default function AdminPanel() {
  const [results, setResults] = useState<Record<string, string>>({})
  const [spResults, setSpResults] = useState<Record<string, SpecialResult>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [savedSp, setSavedSp] = useState<Record<string, boolean>>({})

  useEffect(() => {
    supabase.from('match_results').select('*').then(({ data }) => {
      const map: Record<string, string> = {}
      data?.forEach(r => {
        if (r.home_score !== null && r.away_score !== null) {
          const rh = r.home_score, ra = r.away_score
          map[r.match_id] = rh > ra ? 'H' : ra > rh ? 'B' : 'U'
        }
      })
      setResults(map)
    })
    supabase.from('special_results').select('*').then(({ data }) => {
      const map: Record<string, SpecialResult> = {}
      data?.forEach(s => { map[s.special_id] = s })
      setSpResults(map)
    })
  }, [])

  async function saveResult(matchId: string, pick: string, isKO: boolean) {
    // Store as score equivalent: H=1-0, U=0-0, B=0-1
    const home = pick === 'H' ? 1 : 0
    const away = pick === 'B' ? 1 : 0
    setResults(prev => ({ ...prev, [matchId]: pick }))
    await supabase.from('match_results').upsert(
      { match_id: matchId, home_score: home, away_score: away, updated_at: new Date().toISOString() },
      { onConflict: 'match_id' }
    )
    setSaved(prev => ({ ...prev, [matchId]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [matchId]: false })), 1200)
  }

  async function saveSpecialResult(id: string, val: string) {
    const updated = { special_id: id, answer: val, updated_at: new Date().toISOString() }
    setSpResults(prev => ({ ...prev, [id]: updated }))
    await supabase.from('special_results').upsert(updated, { onConflict: 'special_id' })
    setSavedSp(prev => ({ ...prev, [id]: true }))
    setTimeout(() => setSavedSp(prev => ({ ...prev, [id]: false })), 1200)
  }

  const btnStyle = (matchId: string, val: string, isKO: boolean): React.CSSProperties => {
    const active = results[matchId] === val
    const color = val === 'H' ? '#00c853' : val === 'U' ? '#FFD700' : '#1e90ff'
    return {
      padding: '8px 16px',
      fontWeight: 700,
      fontSize: '0.9rem',
      borderRadius: 7,
      cursor: 'pointer',
      background: active ? color : 'var(--mid)',
      color: active ? '#000' : 'var(--muted)',
      border: `1px solid ${active ? color : 'var(--border)'}`,
      transition: 'all 0.15s',
    }
  }

  const KO_ROUNDS = ['Runde av 32', 'Runde av 16', 'Kvartfinale', 'Semifinale', 'Bronsefinale', 'FINALE']

  return (
    <div>
      <div className="section-title">⚙️ Admin – Legg inn fasit</div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 16 }}>
        Klikk H, U eller B for å sette fasitresultat. Poengtavlen oppdateres umiddelbart.
      </p>

      {/* GRUPPESPILL */}
      <div className="admin-card">
        <h3>📋 Gruppespill</h3>
        {GROUP_MATCHES.map(m => (
          <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <label style={{ flex: 1, fontSize: '0.85rem' }}>{m.home} – {m.away}</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['H', 'U', 'B'].map(v => (
                <button key={v} style={btnStyle(m.id, v, false)} onClick={() => saveResult(m.id, v, false)}>{v}</button>
              ))}
            </div>
            {saved[m.id] && <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>✓</span>}
          </div>
        ))}
      </div>

      {/* SLUTTSPILL */}
      {KO_ROUNDS.map(round => {
        const matches = KO_MATCHES.filter(m => m.round === round && m.home && m.away)
        if (!matches.length) return null
        return (
          <div className="admin-card" key={round}>
            <h3>⚔️ {round}</h3>
            {matches.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <label style={{ flex: 1, fontSize: '0.85rem' }}>{m.home} – {m.away}</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['H', 'B'].map(v => (
                    <button key={v} style={btnStyle(m.id, v, true)} onClick={() => saveResult(m.id, v, true)}>{v}</button>
                  ))}
                </div>
                {saved[m.id] && <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>✓</span>}
              </div>
            ))}
          </div>
        )
      })}

      {/* SPESIALER */}
      <div className="admin-card">
        <h3>⭐ Fasitsvar på spesialer</h3>
        {SPECIALS.map(s => {
          const val = spResults[s.id]?.answer ?? ''
          return (
            <div key={s.id} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--muted)', display: 'block', marginBottom: 4 }}>
                {s.label} (+{s.points}p)
              </label>
              {s.type === 'radio' ? (
                <div className="radio-group">
                  {s.options.map(opt => (
                    <label className="radio-opt" key={opt}>
                      <input type="radio" name={`adm_${s.id}`} value={opt} defaultChecked={val === opt}
                        onChange={() => saveSpecialResult(s.id, opt)} />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <select className="special-input" value={val} onChange={e => saveSpecialResult(s.id, e.target.value)}>
                  <option value="">— Velg fasitsvar —</option>
                  {s.options.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
              {savedSp[s.id] && <div className="saved-badge">✓ Lagret</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
