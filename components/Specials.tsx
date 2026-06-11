'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SPECIALS, VM_START } from '@/lib/data'
import InfoBanner from './InfoBanner'

export default function Specials({ userId }: { userId: string }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('specials').select('*').eq('user_id', userId).then(({ data }) => {
      const map: Record<string, string> = {}
      data?.forEach(s => { map[s.special_id] = s.answer })
      setAnswers(map)
      setLoading(false)
    })
  }, [userId])

  async function handleSave(id: string, val: string) {
    setAnswers(prev => ({ ...prev, [id]: val }))
    await supabase.from('specials').upsert(
      { user_id: userId, special_id: id, answer: val, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,special_id' }
    )
    setSaved(prev => ({ ...prev, [id]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [id]: false })), 1200)
  }

  if (loading) return <div className="loading"><div className="spinner" /><br />Laster spesialer...</div>

  const vmStarted = new Date() >= VM_START
  const answered = Object.keys(answers).length
  const total = SPECIALS.length

  return (
    <div>
      <InfoBanner
        icon="⭐"
        text="Svar på alle spesialtipsene før VM starter 11. juni kl. 22:00. Alle låses ved kampstart og kan ikke endres etterpå. Riktige svar gir varierende poeng – se poengsum ved hvert spørsmål."
        storageKey="info_spesialer"
      />

      {/* Fremdriftsindikator */}
      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 18px', marginBottom: 20,
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text)' }}>
            Dine svar
          </span>
          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: answered === total ? 'var(--green)' : 'var(--navy)' }}>
            {answered}/{total}
          </span>
        </div>
        <div style={{ height: 8, background: 'var(--light)', borderRadius: 8, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${(answered / total) * 100}%`,
            background: answered === total
              ? 'var(--green)'
              : 'linear-gradient(90deg, var(--navy), var(--navy2))',
            borderRadius: 8,
            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
        {vmStarted && (
          <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--red)', fontWeight: 700 }}>
            🔒 VM har startet – alle spesialer er låst
          </div>
        )}
        {!vmStarted && answered < total && (
          <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--muted)' }}>
            Du har {total - answered} ubesvarte spørsmål igjen
          </div>
        )}
        {!vmStarted && answered === total && (
          <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--green)', fontWeight: 700 }}>
            ✓ Alle spørsmål besvart – bra jobba!
          </div>
        )}
      </div>

      {SPECIALS.map(s => {
        const locked = vmStarted
        const val = answers[s.id] ?? ''
        const hasAnswer = val !== ''

        return (
          <div className="special-card" key={s.id} style={{
            borderLeft: hasAnswer ? '4px solid var(--green)' : '4px solid var(--border2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div className="special-title">{s.label}</div>
                <div className="special-desc">{s.desc}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                <span className="points-badge">+{s.points}p</span>
                {locked
                  ? <span className="tag tag-locked">🔒 Låst</span>
                  : hasAnswer
                    ? <span className="tag tag-open">✓ Besvart</span>
                    : <span className="tag" style={{ background: 'rgba(200,147,10,0.1)', color: '#c8930a', border: '1px solid rgba(200,147,10,0.3)' }}>Ikke besvart</span>
                }
              </div>
            </div>

            {s.type === 'radio' ? (
              <div className="radio-group">
                {s.options.map(opt => (
                  <label className="radio-opt" key={opt}>
                    <input
                      type="radio" name={s.id} value={opt}
                      checked={val === opt} disabled={locked}
                      onChange={() => handleSave(s.id, opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <select
                className="special-input"
                value={val} disabled={locked}
                onChange={e => handleSave(s.id, e.target.value)}
              >
                <option value="">— Velg svar —</option>
                {s.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            )}

            {locked && val && (
              <div style={{ marginTop: 10, fontSize: '0.82rem', color: 'var(--muted)' }}>
                Ditt svar: <strong style={{ color: 'var(--navy)' }}>{val}</strong>
              </div>
            )}
            {locked && <div className="special-locked-msg">🔒 Ikke mulig å endre – VM har startet</div>}
            {saved[s.id] && <div className="saved-badge">✓ Lagret</div>}
          </div>
        )
      })}
    </div>
  )
}
