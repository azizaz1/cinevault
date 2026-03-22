import { useState } from 'react'
import { signIn, signUp } from '../lib/auth'

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    if (mode === 'login') {
      const { data, error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        onSuccess(data.user)
        onClose()
      }
    } else {
      const { data, error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setMessage('✅ Compte créé ! Tu peux te connecter maintenant.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #111118, #1a1a26)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#e8e4d9' }}>
            {mode === 'login' ? 'Welcome Back' : 'Join CineVault'}
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#666', fontSize: '14px', marginTop: '4px' }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{
              flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 500,
              background: mode === m ? '#c9a84c' : 'transparent',
              color: mode === m ? '#0a0a0f' : '#888',
              transition: 'all 0.2s',
            }}>
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#e8e4d9',
              padding: '14px 16px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
              outline: 'none',
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', color: '#e8e4d9',
              padding: '14px 16px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>

        {/* Error / Message */}
        {error && (
          <div style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#ff6b6b' }}>
            ❌ {error}
          </div>
        )}
        {message && (
          <div style={{ background: 'rgba(80,255,120,0.1)', border: '1px solid rgba(80,255,120,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#6bffaa' }}>
            {message}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px',
            background: loading ? '#888' : '#c9a84c',
            color: '#0a0a0f', border: 'none', borderRadius: '8px',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        <button onClick={onClose} style={{ width: '100%', marginTop: '12px', padding: '10px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#666', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  )
}