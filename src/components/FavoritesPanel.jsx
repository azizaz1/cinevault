import { useState, useEffect } from 'react'
import { getFavorites, removeFavorite } from '../lib/favorites'

export default function FavoritesPanel({ user, onClose }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getFavorites(user.id).then(({ data }) => {
        setFavorites(data || [])
        setLoading(false)
      })
    }
  }, [user])

  const handleRemove = async (imdbId) => {
    await removeFavorite(user.id, imdbId)
    setFavorites(prev => prev.filter(f => f.movie_imdb_id !== imdbId))
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
        borderRadius: '20px', padding: '36px',
        width: '100%', maxWidth: '640px',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: '#e8e4d9' }}>
              ❤️ Mes Favoris
            </h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#666', fontSize: '13px', marginTop: '4px' }}>
              {favorites.length} film{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none',
            color: '#fff', width: '36px', height: '36px',
            borderRadius: '50%', fontSize: '18px', cursor: 'pointer',
          }}>×</button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontFamily: "'DM Sans', sans-serif" }}>
            Chargement...
          </div>
        )}

        {/* Empty */}
        {!loading && favorites.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#666', fontSize: '15px' }}>
              Aucun favori pour l'instant
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", color: '#444', fontSize: '13px', marginTop: '8px' }}>
              Clique ❤️ sur un film pour l'ajouter !
            </p>
          </div>
        )}

        {/* List */}
        {!loading && favorites.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {favorites.map((fav) => (
              <div key={fav.id} style={{
                display: 'flex', gap: '16px', alignItems: 'center',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '12px', padding: '12px',
              }}>
                <img
                  src={fav.movie_poster}
                  alt={fav.movie_title}
                  style={{ width: '50px', height: '75px', objectFit: 'cover', borderRadius: '6px' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700, color: '#e8e4d9', marginBottom: '4px' }}>
                    {fav.movie_title}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#666' }}>
                    <span>{fav.movie_year}</span>
                    <span>⭐ {fav.movie_rating}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(fav.movie_imdb_id)}
                  style={{
                    background: 'rgba(255,80,80,0.1)',
                    border: '1px solid rgba(255,80,80,0.2)',
                    color: '#ff6b6b', padding: '8px 14px',
                    borderRadius: '8px', cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif", fontSize: '12px',
                  }}
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}