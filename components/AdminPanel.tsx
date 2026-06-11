'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { GROUP_MATCHES, KO_MATCHES, SPECIALS } from '@/lib/data'
import type { SpecialResult } from '@/types'
import InfoBanner from './InfoBanner'

interface MatchResultState {
  home_score: number | null
  away_score: number | null
}

export default function AdminPanel() {
  const [results, setResults] = useState<Record<string, MatchResultState>>({})
  const [spResults, setSpResults] = useState<Record<string, SpecialResult>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [savedSp, setSavedSp] = useState<Record<string, boolean>>({})
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

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
    setTimeout(() => setSaved(prev => ({ ...prev, [matchId]: false })), 1400)
  }

  async function clearResult(matchId: string) {
    setResults(prev => { const n = { ...prev }; delete n[matchId]; return n })
    await supabase.from('match_results').delete().eq('match_id', matchId)
    setSaved(prev => ({ ...prev, [matchId]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [matchId]: false })), 1400)
  }

  async function saveSpecialResult(id: string, val: string) {
    const updated = { special_id: id, answer: val, updated_at: new Date().toISOString() }
    setSpResults(prev => ({ ...prev, [id]: updated }))
    await supabase.from('special_results').upsert(updated, { onConflict: 'special_id' })
    setSavedSp(prev => ({ ...prev, [id]: true }))
    setTimeout(() => setSavedSp(prev => ({ ...prev, [id]: false })), 1400)
  }

  async function triggerSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync-results', {
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET ?? ''}` }
      })
      const data = await res.json()
      setLastSync(`${data.updatedResults ?? 0} resultater, ${data.updatedKO ?? 0} sluttspillkamper oppdatert`)
    } catch {
      setLastSync('Feil ved synkronisering')
    }
    setSyncing(false)
  }

  const inputStyle: React.CSSProperties = {
    width: 50, height: 38, background: 'var(--light)',
    border: '1.5px solid var(--border)', borderRadius: 8,
    color: 'var(--text)', textAlign: 'center', fontSize: '1rem',
    fontWeight: 700, transition: 'border-color 0.2s',
  }

  const resultsCount = Object.keys(results).length
  const KO_ROUNDS = ['Runde av 32', 'Runde av 16', 'Kvartfinale', 'Semifinale', 'Bronsefinale', 'FINALE']

  return (
    <div>
      <InfoBanner
        icon="⚙️"
        text="Legg inn kampresultater manuelt som backup, eller for å korrigere feil. Resultater fra football-data.org synkroniseres automatisk hvert 15. minutt via GitHub Actions."
        storageKey="info_admin"
      />

      {/* Statuskort */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20,
      }}>
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '16px 18px', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Fasitresultater</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'var(--navy)', letterSpacing: '1px' }}>{resultsCount}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>av 104 kamper</div>
        </div>
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '16px 18px', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Spesial-fasit</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', color: 'var(--navy)', letterSpacing: '1px' }}>{Object.keys(spResults).length}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>av {SPECIALS.length} spesialer</div>
        </div>
      </div>

      {/* Manuell sync-knapp */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderLeft: '4px solid var(--green)',
        borderRadius: 14, padding: '16px 18px', marginBottom: 20,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', marginBottom: 3 }}>
              🔄 Synkroniser resultater nå
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              {lastSync ?? 'Kjøres automatisk hvert 15. minutt'}
            </div>
          </div>
          <button
            onClick={triggerSync}
            disabled={syncing}
            style={{
              background: syncing ? 'var(--light)' : 'linear-gradient(135deg, var(--green), #00c853)',
              color: syncing ? 'var(--muted)' : '#fff',
              border: 'none', borderRadius: 10,
              padding: '10px 18px', fontWeight: 800, fontSize: '0.82rem',
              cursor: syncing ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s',
              whiteSpace: 'nowrap',
            }}
          >
            {syncing ? '⏳ Syncer...' : 'Synk nå'}
          </button>
        </div>
      </div>

      {/* GRUPPESPILL */}
      <div className="admin-card">
        <h3>📋 Gruppespill – fasitresultater</h3>
        {GROUP_MATCHES.map(m => {
          const r = results[m.id]
          const hasResult = r?.home_score !== null && r?.away_score !== null && r !== undefined
          return (
            <div key={m.id} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 10, paddingBottom: 10,
              borderBottom: '1px solid var(--border)',
              flexWrap: 'wrap',
            }}>
              <label style={{ flex: 1, fontSize: '0.83rem', fontWeight: 600, minWidth: 130 }}>
                {m.home} – {m.away}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  style={{ ...inputStyle, borderColor: hasResult ? 'var(--green)' : 'var(--border)' }}
                  type="number" min={0} max={20}
                  value={r?.home_score ?? ''}
                  placeholder="H"
                  onChange={e => saveResult(m.id, 'home', e.target.value)}
                />
                <span style={{ color: 'var(--muted)', fontWeight: 700 }}>–</span>
                <input
                  style={{ ...inputStyle, borderColor: hasResult ? 'var(--green)' : 'var(--border)' }}
                  type="number" min={0} max={20}
                  value={r?.away_score ?? ''}
                  placeholder="B"
                  onChange={e => saveResult(m.id, 'away', e.target.value)}
                />
                {hasResult && (
                  <button onClick={() => clearResult(m.id)} style={{
                    background: 'rgba(200,16,46,0.07)',
                    border: '1px solid rgba(200,16,46,0.2)',
                    color: 'var(--red)', borderRadius: 7,
                    padding: '7px 10px', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 800,
                    transition: 'all 0.2s',
                  }}>Slett</button>
                )}
                {saved[m.id] && <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 700 }}>✓</span>}
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
              const hasResult = r?.home_score !== null && r?.away_score !== null && r !== undefined
              return (
                <div key={m.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 10, paddingBottom: 10,
                  borderBottom: '1px solid var(--border)',
                  flexWrap: 'wrap',
                }}>
                  <label style={{ flex: 1, fontSize: '0.83rem', fontWeight: 600, minWidth: 130 }}>
                    {m.home} – {m.away}
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      style={{ ...inputStyle, borderColor: hasResult ? 'var(--green)' : 'var(--border)' }}
                      type="number" min={0} max={20}
                      value={r?.home_score ?? ''} placeholder="H"
                      onChange={e => saveResult(m.id, 'home', e.target.value)}
                    />
                    <span style={{ color: 'var(--muted)', fontWeight: 700 }}>–</span>
                    <input
                      style={{ ...inputStyle, borderColor: hasResult ? 'var(--green)' : 'var(--border)' }}
                      type="number" min={0} max={20}
                      value={r?.away_score ?? ''} placeholder="B"
                      onChange={e => saveResult(m.id, 'away', e.target.value)}
                    />
                    {hasResult && (
                      <button onClick={() => clearResult(m.id)} style={{
                        background: 'rgba(200,16,46,0.07)',
                        border: '1px solid rgba(200,16,46,0.2)',
                        color: 'var(--red)', borderRadius: 7,
                        padding: '7px 10px', cursor: 'pointer',
                        fontSize: '0.75rem', fontWeight: 800,
                      }}>Slett</button>
                    )}
                    {saved[m.id] && <span style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 700 }}>✓</span>}
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
            <div key={s.id} style={{ marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', flex: 1 }}>
                  {s.label}
                </label>
                <span className="points-badge">+{s.points}p</span>
                {val && <span className="tag tag-open">✓ Satt</span>}
              </div>
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
