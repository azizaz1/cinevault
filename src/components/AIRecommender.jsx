import { useState } from 'react'

const movieDatabase = {
  sad: ['Schindler\'s List', 'The Green Mile', 'Titanic', 'Grave of the Fireflies'],
  happy: ['The Grand Budapest Hotel', 'Superbad', 'Home Alone', 'The Mask'],
  scary: ['The Conjuring', 'Hereditary', 'Get Out', 'A Quiet Place'],
  action: ['Mad Max Fury Road', 'John Wick', 'The Dark Knight', 'Inception'],
  romance: ['The Notebook', 'La La Land', 'Crazy Rich Asians', 'Before Sunrise'],
  think: ['Interstellar', 'Parasite', 'The Matrix', 'Shutter Island'],
  adventure: ['Indiana Jones', 'The Lord of the Rings', 'Avatar', 'Jurassic Park'],
  classic: ['The Godfather', 'Goodfellas', 'Pulp Fiction', 'Fight Club'],
}

const moodMap = {
  'pleurer': 'sad', 'triste': 'sad', 'sad': 'sad', 'cry': 'sad',
  'rire': 'happy', 'drôle': 'happy', 'funny': 'happy', 'happy': 'happy', 'comédie': 'happy',
  'peur': 'scary', 'horreur': 'scary', 'scary': 'scary', 'horror': 'scary',
  'action': 'action', 'adrénaline': 'action', 'fight': 'action',
  'amour': 'romance', 'romance': 'romance', 'love': 'romance',
  'réfléchir': 'think', 'intelligent': 'think', 'mind': 'think', 'cerveau': 'think',
  'aventure': 'adventure', 'adventure': 'adventure', 'voyage': 'adventure',
  'classique': 'classic', 'classic': 'classic', 'old': 'classic',
}

const moodEmojis = {
  sad: '😢', happy: '😂', scary: '😱',
  action: '💥', romance: '❤️', think: '🧠',
  adventure: '🚀', classic: '🎬',
}

const moodLabels = {
  sad: 'films émouvants', happy: 'comédies', scary: 'films d\'horreur',
  action: 'films d\'action', romance: 'films romantiques', think: 'films qui font réfléchir',
  adventure: 'films d\'aventure', classic: 'grands classiques',
}

const quickMoods = [
  { label: '😢 Je veux pleurer', key: 'sad' },
  { label: '😂 Je veux rire', key: 'happy' },
  { label: '😱 J\'ai peur', key: 'scary' },
  { label: '💥 Action intense', key: 'action' },
  { label: '❤️ Romance', key: 'romance' },
  { label: '🧠 Faire réfléchir', key: 'think' },
  { label: '🚀 Aventure', key: 'adventure' },
  { label: '🎬 Classique', key: 'classic' },
]

const detectMood = (text) => {
  const lower = text.toLowerCase()
  for (const [keyword, mood] of Object.entries(moodMap)) {
    if (lower.includes(keyword)) return mood
  }
  return 'action'
}

export default function AIRecommender({ onClose, onSearch }) {
  const [mood, setMood] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState(null)
  const [detectedMood, setDetectedMood] = useState(null)

  const getRecommendations = (moodKey = null) => {
    setLoading(true)
    setRecommendations(null)

    setTimeout(() => {
      const key = moodKey || detectMood(mood)
      setDetectedMood(key)
      setRecommendations(movieDatabase[key] || movieDatabase['action'])
      setLoading(false)
    }, 1000)
  }

  const handleQuickMood = (key) => {
    setMood(quickMoods.find(m => m.key === key)?.label || '')
    getRecommendations(key)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(135deg, #0d0d1a, #1a1a2e)',
        border: '1px solid rgba(201,168,76,0.3)',
        borderRadius: '20px', padding: '40px',
        width: '100%', maxWidth: '560px',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#e8e4d9', marginBottom: '8px' }}>
            AI Movie Recommender
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#666', fontSize: '14px' }}>
            Dis-moi ton mood et je trouve le film parfait
          </p>
        </div>

        {/* Quick moods */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', justifyContent: 'center' }}>
          {quickMoods.map(m => (
            <button key={m.key} onClick={() => handleQuickMood(m.key)} style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#aaa', padding: '8px 14px',
              borderRadius: '20px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.borderColor = '#c9a84c'; e.target.style.color = '#c9a84c' }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.color = '#aaa' }}
            >{m.label}</button>
          ))}
        </div>

        {/* Input */}
        <textarea
          placeholder="Ex: je veux un film triste qui me fait réfléchir..."
          value={mood}
          onChange={e => setMood(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', color: '#e8e4d9',
            padding: '14px 16px', marginBottom: '16px',
            fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
            outline: 'none', resize: 'none',
          }}
        />

        {/* Button */}
        <button
          onClick={() => getRecommendations()}
          disabled={loading || !mood.trim()}
          style={{
            width: '100%', padding: '14px',
            background: loading || !mood.trim() ? '#333' : '#c9a84c',
            color: loading || !mood.trim() ? '#666' : '#0a0a0f',
            border: 'none', borderRadius: '10px',
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            fontSize: '15px', cursor: loading || !mood.trim() ? 'not-allowed' : 'pointer',
            marginBottom: '24px', transition: 'all 0.2s',
          }}
        >
          {loading ? '🤖 Analyse en cours...' : '✨ Trouve mes films'}
        </button>

        {/* Results */}
        {recommendations && detectedMood && (
          <div>
            <div style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
              borderRadius: '10px', padding: '12px 16px',
              marginBottom: '20px',
              fontFamily: "'DM Sans', sans-serif", fontSize: '14px',
              color: '#c9a84c', fontStyle: 'italic',
            }}>
              {moodEmojis[detectedMood]} Mood détecté : {moodLabels[detectedMood]}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recommendations.map((title, i) => (
                <div key={i}
                  onClick={() => { onSearch(title); onClose() }}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '14px 16px',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                >
                  <span style={{ fontSize: '24px' }}>{moodEmojis[detectedMood]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700, color: '#e8e4d9' }}>
                      {title}
                    </div>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#c9a84c', marginTop: '2px' }}>
                      🔍 Clique pour rechercher →
                    </div>
                  </div>
                  <span style={{ color: '#444', fontSize: '18px' }}>›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={onClose} style={{
          width: '100%', marginTop: '16px', padding: '10px',
          background: 'transparent',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', color: '#666',
          fontFamily: "'DM Sans', sans-serif", fontSize: '14px', cursor: 'pointer',
        }}>
          Fermer
        </button>
      </div>
    </div>
  )
}
