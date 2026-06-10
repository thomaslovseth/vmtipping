'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GROUP_MATCHES, KO_MATCHES, SPECIALS } from '@/lib/data'
import type { SpecialResult } from '@/types'

interface MatchResultState {
  home_score: number | null
  away_score: number | null
}

export default function AdminPanel() {
  const [results, setResults] = useState<Record<string, MatchResultState>>({})
  const [spResults, setSpResults] = useState<Record<string, SpecialResult>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [savedSp, setSavedSp] = useState<Record<string, boolean>>({})

  useEffect(() => {
    supabase.from('match_results').select('*').then(({ data }) => {
      const map: Record<string, MatchResultState> = {}
      data?.forEach(r => { map[r.match_id] = { home_score: r.home_score, away_score: r.away_score } })
      setResults(map)
    })
    supabase.from('special_results').select('*').then(({ data }) => {
      const map: Record<string, SpecialResult> = {}
      data?.forEach(s => { map[s.special_id] = s })
      setSpResults(map)
    })
  }, [])

  async function saveResult(matchId: string, side: 'home' | 'away', val: string) {
    const current = results[matchId] ?? { home_score: null, away_score: null }
    const updated = {
      ...current,
      [side === 'home' ? 'home_score' : 'away_score']: val === '' ? null : parseInt(val),
    }
    setResults(prev => ({ ...prev, [matchId]: updated }))
    await supabase.from('match_results').upsert(
      { match_id: matchId, ...updated, updated_at: new Date().toISOString() },
      { onConflict: 'match_id' }
    )
    setSaved(prev => ({ ...prev, [matchId]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [matchId]: false })), 1200)
  }

  async function clearResult(matchId: string) {
    setResults(prev => { const n = { ...prev }; delete n[matchId]; return n })
    await supabase.from('match_results').delete().eq('match_id', matchId)
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

  const inputStyle: React.CSSProperties = {
    width: 48, height: 36, background: 'var(--mid)',
    border: '1px solid var(--border)', borderRadius: 7,
    color: 'var(--text)', textAlign: 'center', fontSize: '1rem',
  }

  const KO_ROUNDS = ['Runde av 32', 'Runde av 16', 'Kvartfinale', 'Semifinale', 'Bronsefinale', 'FINALE']

  return (
    <div>
      <div className="section-title">⚙️ Admin – Legg inn / endre fasit</div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 16 }}>
        Legg inn målresultat direkte. Slett for å fjerne feilregistrering. Poengtavlen oppdateres umiddelbart.
      </p>

      {/* GRUPPESPILL */}
      <div className="admin-card">
        <h3>📋 Gruppespill</h3>
        {GROUP_MATCHES.map(m => {
          const r = results[m.id]
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <label style={{ flex: 1, fontSize: '0.82rem', minWidth: 140 }}>{m.home} – {m.away}</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input style={inputStyle} type="number" min={0} max={20}
                  value={r?.home_score ?? ''} placeholder="H"
                  onChange={e => saveResult(m.id, 'home', e.target.value)} />
                <span style={{ color: 'var(--muted)' }}>–</span>
                <input style={inputStyle} type="number" min={0} max={20}
                  value={r?.away_score ?? ''} placeholder="B"
                  onChange={e => saveResult(m.id, 'away', e.target.value)} />
                {r && (
                  <button onClick={() => clearResult(m.id)} style={{
                    background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.3)',
                    color: '#ff6b6b', borderRadius: 6, padding: '6px 10px',
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                  }}>Slett</button>
                )}
                {saved[m.id] && <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>✓</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* SLUTTSPILL */}
      {KO_ROUNDS.map(round => {
        const matches = KO_MATCHES.filter(m => m.round === round && m.home && m.away)
        if (!matches.length) return null
        return (
          <div className="admin-card" key={round}>
            <h3>⚔️ {round}</h3>
            {matches.map(m => {
              const r = results[m.id]
              return (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  <label style={{ flex: 1, fontSize: '0.82rem', minWidth: 140 }}>{m.home} – {m.away}</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input style={inputStyle} type="number" min={0} max={20}
                      value={r?.home_score ?? ''} placeholder="H"
                      onChange={e => saveResult(m.id, 'home', e.target.value)} />
                    <span style={{ color: 'var(--muted)' }}>–</span>
                    <input style={inputStyle} type="number" min={0} max={20}
                      value={r?.away_score ?? ''} placeholder="B"
                      onChange={e => saveResult(m.id, 'away', e.target.value)} />
                    {r && (
                      <button onClick={() => clearResult(m.id)} style={{
                        background: 'rgba(255,23,68,0.1)', border: '1px solid rgba(255,23,68,0.3)',
                        color: '#ff6b6b', borderRadius: 6, padding: '6px 10px',
                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700,
                      }}>Slett</button>
                    )}
                    {saved[m.id] && <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>✓</span>}
                  </div>
                </div>
              )
            })}
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
                      <input type="radio" name={`adm_${s.id}`} value={opt}
                        checked={val === opt} onChange={() => saveSpecialResult(s.id, opt)} />
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
