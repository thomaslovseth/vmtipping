'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SPECIALS, VM_START } from '@/lib/data'

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

  return (
    <div>
      <div className="section-title">⭐ Spesialtips</div>
      <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: 16 }}>
        ⚠️ Alle spesialer låses når VM starter 11. juni kl. 21:00!
      </p>
      {SPECIALS.map(s => {
        const locked = vmStarted
        const val = answers[s.id] ?? ''
        return (
          <div className="special-card" key={s.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div className="special-title">{s.label}{s.lockAtStart ? ' *' : ''}</div>
              <span className="points-badge">+{s.points}p</span>
              {locked
                ? <span className="tag tag-locked">Låst</span>
                : <span className="tag tag-open">Åpen</span>}
            </div>
            <div className="special-desc">{s.desc}</div>

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

            {locked && <div className="special-locked-msg">🔒 Ikke mulig å endre – VM har startet</div>}
            {saved[s.id] && <div className="saved-badge">✓ Lagret</div>}
          </div>
        )
      })}
    </div>
  )
}
