'use client'

import { useState, KeyboardEvent } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

interface Props {
  onLogin: (user: User) => void
}

export default function LoginScreen({ onLogin }: Props) {
  const [isReg, setIsReg] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAuth() {
    setError('')
    if (!username || !password) { setError('Fyll inn brukernavn og passord'); return }
    setLoading(true)
    try {
      if (isReg) {
        if (password.length < 4) { setError('Passord må ha minst 4 tegn'); setLoading(false); return }
        const { data: existing } = await supabase
          .from('users').select('id').eq('username', username.toLowerCase()).single()
        if (existing) { setError('Brukernavnet er allerede tatt'); setLoading(false); return }
        const { data, error: err } = await supabase
          .from('users')
          .insert({ username: username.toLowerCase(), password, display_name: displayName || username, is_admin: false })
          .select().single()
        if (err) throw err
        onLogin(data as User)
      } else {
        const { data, error: err } = await supabase
          .from('users').select('*').eq('username', username.toLowerCase()).single()
        if (err || !data || data.password !== password) {
          setError('Feil brukernavn eller passord'); setLoading(false); return
        }
        onLogin(data as User)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ukjent feil')
    }
    setLoading(false)
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'Enter') handleAuth()
  }

  return (
    <div className="login-screen">
      <div className="login-logo">
        <div className="login-ball">⚽</div>
        <h1>ØRST VM-TIPPING</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
          FIFA World Cup 2026 · USA / Canada / Mexico
        </p>
      </div>
      <div className="login-box">
        <h2>{isReg ? 'Lag ny bruker' : 'Logg inn'}</h2>
        <div className="form-group">
          <label>Brukernavn</label>
          <input value={username} onChange={e => setUsername(e.target.value)} onKeyDown={onKey} placeholder="ditt brukernavn" autoComplete="username" />
        </div>
        <div className="form-group">
          <label>Passord</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={onKey} placeholder="••••••••" autoComplete="current-password" />
        </div>
        {isReg && (
          <div className="form-group">
            <label>Visningsnavn</label>
            <input value={displayName} onChange={e => setDisplayName(e.target.value)} onKeyDown={onKey} placeholder="f.eks. Thomas" />
          </div>
        )}
        <button className="btn" onClick={handleAuth} disabled={loading}>
          {loading ? '...' : isReg ? 'Registrer' : 'Logg inn'}
        </button>
        <button className="btn btn-outline" onClick={() => { setIsReg(!isReg); setError('') }}>
          {isReg ? 'Har allerede konto' : 'Lag ny bruker'}
        </button>
        {error && <p className="error-msg">{error}</p>}
      </div>
      <div className="login-toggle">
        <span onClick={() => setUsername('admin')}>Admin-innlogging</span>
      </div>
    </div>
  )
}
