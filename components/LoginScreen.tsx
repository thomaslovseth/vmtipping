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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#06080f' }}>

      {/* HERO */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '55vh',
        minHeight: 280,
        overflow: 'hidden',
      }}>
        {/* Bilde */}
        <img
          src="/hero.jpg"
          alt="Norske fotballfans"
          style={{
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 30%',
          }}
        />
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(6,8,15,0.85) 100%)',
        }} />
        {/* Tekst over bildet */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '32px 24px 28px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-block',
            background: 'rgba(200,16,46,0.85)',
            color: '#fff',
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            padding: '5px 16px',
            borderRadius: 24,
            marginBottom: 12,
            backdropFilter: 'blur(8px)',
          }}>
            ⚽ 28 år siden sist!
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(2.4rem, 8vw, 4.5rem)',
            letterSpacing: '4px',
            color: '#fff',
            lineHeight: 1,
            textShadow: '0 4px 24px rgba(0,0,0,0.5)',
            marginBottom: 8,
          }}>
            FOTBALLTIPPING.NO
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.75)',
            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)',
            fontWeight: 500,
            letterSpacing: '0.5px',
          }}>
            FIFA World Cup 2026 · USA / Canada / Mexico
          </p>
        </div>
      </div>

      {/* LOGIN FORM */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '28px 20px 40px',
        background: 'linear-gradient(180deg, #06080f 0%, #0a0e1a 100%)',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 24,
          padding: '32px',
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }}>
          <h2 style={{
            textAlign: 'center', marginBottom: 24,
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '1.6rem', letterSpacing: '2.5px',
            color: 'var(--navy)',
          }}>
            {isReg ? 'Lag ny bruker' : 'Logg inn'}
          </h2>

          <div className="form-group">
            <label>Brukernavn</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={onKey}
              placeholder="ditt brukernavn"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Passord</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={onKey}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {isReg && (
            <>
              <p style={{
                fontSize: '0.75rem', color: 'var(--muted)',
                marginTop: -8, marginBottom: 12, lineHeight: 1.5,
              }}>
                ⚠️ Ikke bruk et passord du bruker andre steder – passord lagres ikke kryptert.
              </p>
              <div className="form-group">
                <label>Visningsnavn</label>
                <input
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  onKeyDown={onKey}
                  placeholder="f.eks. Thomas"
                />
              </div>
            </>
          )}

          <button className="btn" onClick={handleAuth} disabled={loading}>
            {loading ? '...' : isReg ? 'Registrer' : 'Logg inn'}
          </button>
          <button className="btn btn-outline" onClick={() => { setIsReg(!isReg); setError('') }}>
            {isReg ? 'Har allerede konto' : 'Lag ny bruker'}
          </button>

          {error && <p className="error-msg">{error}</p>}
        </div>

        <div style={{
          marginTop: 16, fontSize: '0.8rem',
          color: 'rgba(255,255,255,0.4)',
        }}>
          <span
            style={{ cursor: 'pointer', textDecoration: 'underline', color: 'rgba(255,215,0,0.6)' }}
            onClick={() => setUsername('admin')}
          >
            Admin
          </span>
        </div>
      </div>
    </div>
  )
}
