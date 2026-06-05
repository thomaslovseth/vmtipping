'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GROUP_MATCHES, SPECIALS } from '@/lib/data'
import type { MatchResult, SpecialResult } from '@/types'

export default function AdminPanel() {
  const [results, setResults] = useState<Record<string, MatchResult>>({})
  const [spResults, setSpResults] = useState<Record<string, SpecialResult>>({})
  const [savedMatch, setSavedMatch] = useState<Record<string, boolean>>({})
  const [savedSp, setSavedSp] = useState<Record<string, boolean>>({})

  useEffect(() => {
    supabase.from('match_results').select('*').then(({ data }) => {
      const map: Record<string, MatchResult> = {}
      data?.forEach(r => { map[r.match_id] = r })
      setResults(map)
    })
    supabase.from('special_results').select('*').then(({ data }) => {
      const map: Record<string, SpecialResult> = {}
      data?.forEach(s => { map[s.special_id] = s })
      setSpResults(map)
    })
  }, [])

  async function saveResult(matchId: string, side: 'home' | 'away', val: string) {
    const updated = {
      ...results[matchId],
      match_id: matchId,
      [side === 'home' ? 'home_score' : 'away_score']: val === '' ? null : parseInt(val),
      updated_at: new Date().toISOString(),
    }
    setResults(prev => ({ ...prev, [matchId]: updated }))
    await supabase.from('match_results').upsert(updated, { onConflict: 'match_id' })
    setSavedMatch(prev => ({ ...prev, [matchId]: true }))
    setTimeout(() => setSavedMatch(prev => ({ ...prev, [matchId]: false })), 1200)
  }

  async function saveSpecialResult(id: string, val: string) {
    const updated = { special_id: id, answer: val, updated_at: new Date().toISOString() }
    setSpResults(prev => ({ ...prev, [id]: updated }))
    await supabase.from('special_results').upsert(updated, { onConflict: 'special_id' })
    setSavedSp(prev => ({ ...prev, [id]: true }))
    setTimeout(() => setSavedSp(prev => ({ ...prev, [id]: false })), 1200)
  }

  return (
    <div>
      <div className="section-title">⚙️ Admin – Legg inn fasit</div>
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem', marginBottom: 16 }}>
        Resultater lagres direkte til Supabase og påvirker poengtavlen umiddelbart.
      </p>

      <div className="admin-card">
        <h3>📋 Gruppespill – fasitresultater</h3>
        {GROUP_MATCHES.map(m => {
          const r = results[m.id] ?? {}
          return (
            <div className="result-row" key={m.id}>
              <label>{m.home} – {m.away}</label>
              <input
                className="result-box" type="number" min={0}
                defaultValue={r.home_score ?? ''}
                placeholder="H"
                onChange={e => saveResult(m.id, 'home', e.target.value)}
              />
              <span style={{ color: 'var(--muted)' }}>–</span>
              <input
                className="result-box" type="number" min={0}
                defaultValue={r.away_score ?? ''}
                placeholder="B"
                onChange={e => saveResult(m.id, 'away', e.target.value)}
              />
              {savedMatch[m.id] && <span style={{ fontSize: '0.75rem', color: 'var(--green)' }}>✓</span>}
            </div>
          )
        })}
      </div>

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
                      <input
                        type="radio" name={`adm_${s.id}`} value={opt}
                        defaultChecked={val === opt}
                        onChange={() => saveSpecialResult(s.id, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <select
                  className="special-input"
                  value={val}
                  onChange={e => saveSpecialResult(s.id, e.target.value)}
                >
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
