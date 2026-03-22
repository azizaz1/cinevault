import { useState, useEffect } from 'react'

export default function ActorPage({ actorName, onClose, onSelectMovie, allMovies }) {
  const [actorInfo, setActorInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActor = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(actorName)}`
        )
        const data = await res.json()
        setActorInfo(data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchActor()
  }, [actorName])

  // Films where actor appears from our loaded movies
  const actorMovies = allMovies.filter(m =>
    m.Actors?.toLowerCase().includes(actorName.split(' ').pop().toLowerCase())
  )

  const initials = actorName.split(' ').map(n => n[0]).join('').slice(0, 2)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(4,3,4,0.95)',
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', animation: 'fadeIn 0.3s ease',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'linear-gradient(160deg, #100e11, #0a080b)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: '16px', width: '100%', maxWidth: '760px',
        maxHeight: '90vh', overflowY: 'auto',
        animation: 'slideUp 0.4s cubic-bezier(.22,.68,0,1.2)',
        boxShadow: '0 60px 120px rgba(0,0,0,0.8)',
      }}>

        {/* Header */}
        <div style={{ padding: '36px 36px 28px', borderBottom: '1px solid rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', gap: '28px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#7a7070', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer' }}>×</button>

          {/* Photo or Avatar */}
          {actorInfo?.thumbnail?.source ? (
            <img
              src={actorInfo.thumbnail.source}
              alt={actorName}
              style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top', border: '3px solid rgba(201,168,76,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: 'linear-gradient(135deg, #c9a84c, #8b6914)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, color: '#080608', flexShrink: 0, border: '3px solid rgba(201,168,76,0.3)' }}>
              {initials}
            </div>
          )}

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '8px' }}>✦ Actor / Actress</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '38px', fontWeight: 600, color: '#f0ebe3', lineHeight: 1, marginBottom: '12px' }}>{actorName}</h2>

            {/* Bio extract */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '16px', height: '16px', border: '2px solid rgba(201,168,76,0.2)', borderTopColor: '#c9a84c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#7a7070' }}>Loading info...</span>
              </div>
            )}

            {!loading && actorInfo?.description && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <span style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)', padding: '5px 14px', borderRadius: '3px', fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#c9a84c' }}>
                  {actorInfo.description}
                </span>
                <span style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '5px 14px', borderRadius: '3px', fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: '#7a7070' }}>
                  🎬 {actorMovies.length} films on CineVault
                </span>
              </div>
            )}

            {!loading && actorInfo?.extract && (
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: '#7a7070', lineHeight: 1.6, maxWidth: '500px' }}>
                {actorInfo.extract.slice(0, 200)}...
              </p>
            )}
          </div>
        </div>

        {/* Movies on CineVault */}
        <div style={{ padding: '28px 36px 36px' }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '3px', color: '#7a7070', textTransform: 'uppercase', marginBottom: '20px' }}>
            Films on CineVault
          </div>

          {actorMovies.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#7a7070', fontFamily: "'Outfit', sans-serif", fontSize: '14px' }}>
              No films found for this actor in our collection.
            </div>
          )}

          {actorMovies.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
              {actorMovies.map((movie, i) => (
                <div
                  key={i}
                  onClick={() => { onSelectMovie(movie); onClose() }}
                  style={{ cursor: 'pointer', borderRadius: '6px', overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none' }}
                >
                  <img src={movie.Poster} alt={movie.Title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '14px', fontWeight: 600, color: '#f0ebe3', marginBottom: '4px', lineHeight: 1.2 }}>{movie.Title}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: '#7a7070' }}>{movie.Year}</span>
                      <span style={{ background: '#f5c518', color: '#000', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '10px', padding: '2px 6px', borderRadius: '2px' }}>★ {movie.imdbRating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}