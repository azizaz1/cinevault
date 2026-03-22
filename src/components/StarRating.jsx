import { useState, useEffect } from 'react'
import { saveRating, getRating } from '../lib/ratings'

export default function StarRating({ movie, user }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user && movie?.imdbID) {
      getRating(user.id, movie.imdbID).then(({ data }) => {
        if (data) setRating(data.rating)
      })
    }
  }, [user, movie])

  const handleRate = async (star) => {
    if (!user) {
      alert('Tu dois être connecté pour noter un film !')
      return
    }
    setLoading(true)
    setRating(star)
    const { error } = await saveRating(user.id, movie, star)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setLoading(false)
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '11px', letterSpacing: '2px',
        color: '#666', marginBottom: '8px', fontWeight: 600,
      }}>
        TA NOTE
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            disabled={loading}
            style={{
              background: 'none', border: 'none',
              fontSize: '28px', cursor: 'pointer',
              color: star <= (hover || rating) ? '#F5C518' : '#333',
              transition: 'all 0.15s',
              transform: star <= hover ? 'scale(1.2)' : 'scale(1)',
              padding: '2px',
            }}
          >
            ★
          </button>
        ))}
        {rating > 0 && (
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px', color: '#888', marginLeft: '4px',
          }}>
            {saved ? '✅ Sauvegardé !' : `${rating}/5`}
          </span>
        )}
        {!user && (
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '12px', color: '#555', marginLeft: '4px',
          }}>
            Connecte-toi pour noter
          </span>
        )}
      </div>
    </div>
  )
}