import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function FilmDuel({ movies, onClose }) {
  const [pair, setPair] = useState([])
  const [voted, setVoted] = useState(false)
  const [winner, setWinner] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [view, setView] = useState('duel')
  const [animating, setAnimating] = useState(false)

  const getRandomPair = () => {
    const shuffled = [...movies].sort(() => Math.random() - 0.5)
    setPair([shuffled[0], shuffled[1]])
    setVoted(false)
    setWinner(null)
    setAnimating(false)
  }

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('film_duel_scores')
      .select('*')
      .order('wins', { ascending: false })
      .limit(10)
    setLeaderboard(data || [])
  }

  useEffect(() => {
    getRandomPair()
    fetchLeaderboard()
  }, [])

  const handleVote = async (winnerMovie, loserMovie) => {
    if (voted) return
    setAnimating(true)
    setVoted(true)
    setWinner(winnerMovie.imdbID)

    // Update winner score
    const { data: existingWinner } = await supabase
      .from('film_duel_scores')
      .select('*')
      .eq('imdb_id', winnerMovie.imdbID)
      .single()

    if (existingWinner) {
      await supabase.from('film_duel_scores').update({ wins: existingWinner.wins + 1 }).eq('imdb_id', winnerMovie.imdbID)
    } else {
      await supabase.from('film_duel_scores').insert({ imdb_id: winnerMovie.imdbID, title: winnerMovie.Title, poster_url: winnerMovie.Poster, wins: 1, losses: 0 })
    }

    // Update loser score
    const { data: existingLoser } = await supabase
      .from('film_duel_scores')
      .select('*')
      .eq('imdb_id', loserMovie.imdbID)
      .single()

    if (existingLoser) {
      await supabase.from('film_duel_scores').update({ losses: existingLoser.losses + 1 }).eq('imdb_id', loserMovie.imdbID)
    } else {
      await supabase.from('film_duel_scores').insert({ imdb_id: loserMovie.imdbID, title: loserMovie.Title, poster_url: loserMovie.Poster, wins: 0, losses: 1 })
    }

    // Log vote
    await supabase.from('film_duel_votes').insert({
      winner_imdb_id: winnerMovie.imdbID,
      winner_title: winnerMovie.Title,
      loser_imdb_id: loserMovie.imdbID,
      loser_title: loserMovie.Title,
    })

    await fetchLeaderboard()
  }

  const winRate = (w, l) => {
    const total = w + l
    return total === 0 ? 0 : Math.round((w / total) * 100)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(4,3,4,0.96)',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '900px',
        background: 'linear-gradient(160deg, #100e11, #0a080b)',
        border: '1px solid rgba(201,168,76,0.15)',
        borderRadius: '16px', overflow: 'hidden',
        maxHeight: '92vh', overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ padding: '28px 36px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '3px', color: '#c9a84c', textTransform: 'uppercase', marginBottom: '6px' }}>⚔️ Film Duel</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: '#f0ebe3' }}>Which film wins?</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={() => setView(view === 'duel' ? 'leaderboard' : 'duel')} style={{
              background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
              color: '#c9a84c', padding: '8px 16px', borderRadius: '4px',
              fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 600,
              letterSpacing: '1px', cursor: 'pointer',
            }}>
              {view === 'duel' ? '🏆 Leaderboard' : '⚔️ Duel'}
            </button>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#7a7070', width: '34px', height: '34px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer' }}>×</button>
          </div>
        </div>

        {/* DUEL VIEW */}
        {view === 'duel' && pair.length === 2 && (
          <div style={{ padding: '32px 36px' }}>
            {!voted && (
              <p style={{ textAlign: 'center', fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: '#7a7070', marginBottom: '28px', letterSpacing: '1px' }}>
                TAP THE FILM YOU PREFER
              </p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
              {/* Film A */}
              {pair.map((movie, idx) => (
                <>
                  <div
                    key={movie.imdbID}
                    onClick={() => !voted && handleVote(movie, pair[idx === 0 ? 1 : 0])}
                    style={{
                      cursor: voted ? 'default' : 'pointer',
                      borderRadius: '10px', overflow: 'hidden',
                      border: winner === movie.imdbID
                        ? '2px solid #c9a84c'
                        : voted && winner !== movie.imdbID
                        ? '2px solid rgba(255,255,255,0.05)'
                        : '2px solid transparent',
                      transform: winner === movie.imdbID ? 'scale(1.02)' : voted && winner !== movie.imdbID ? 'scale(0.97)' : 'scale(1)',
                      opacity: voted && winner !== movie.imdbID ? 0.5 : 1,
                      transition: 'all 0.4s cubic-bezier(.22,.68,0,1.2)',
                      position: 'relative',
                    }}
                  >
                    <img src={movie.Poster} alt={movie.Title} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,6,8,0.95) 0%, transparent 60%)' }} />

                    {/* Winner crown */}
                    {winner === movie.imdbID && (
                      <div style={{ position: 'absolute', top: '12px', right: '12px', fontSize: '28px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>👑</div>
                    )}

                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 600, color: '#f0ebe3', marginBottom: '4px' }}>
                        {movie.Title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: '#f5c518', fontFamily: "'Outfit', sans-serif", fontSize: '12px', fontWeight: 600 }}>★ {movie.imdbRating}</span>
                        <span style={{ color: '#7a7070', fontFamily: "'Outfit', sans-serif", fontSize: '11px' }}>{movie.Year}</span>
                      </div>

                      {/* Vote result */}
                      {voted && (
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: winner === movie.imdbID ? '100%' : '0%',
                              background: winner === movie.imdbID ? '#c9a84c' : 'transparent',
                              borderRadius: '2px', transition: 'width 0.6s ease',
                            }} />
                          </div>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: winner === movie.imdbID ? '#c9a84c' : '#7a7070', marginTop: '6px', fontWeight: 600 }}>
                            {winner === movie.imdbID ? '✓ YOUR PICK' : '✗ NOT CHOSEN'}
                          </div>
                        </div>
                      )}

                      {!voted && (
                        <div style={{ marginTop: '10px', background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.2)', padding: '6px 12px', borderRadius: '3px', display: 'inline-block' }}>
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', color: '#c9a84c', fontWeight: 600, letterSpacing: '1.5px' }}>PICK THIS</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* VS divider */}
                  {idx === 0 && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: 300, color: 'rgba(201,168,76,0.3)', lineHeight: 1 }}>VS</div>
                    </div>
                  )}
                </>
              ))}
            </div>

            {/* Next duel button */}
            {voted && (
              <div style={{ textAlign: 'center', marginTop: '28px' }}>
                <button
                  onClick={getRandomPair}
                  style={{
                    background: '#c9a84c', color: '#080608',
                    border: 'none', borderRadius: '4px',
                    padding: '14px 40px',
                    fontFamily: "'Outfit', sans-serif",
                    fontWeight: 700, fontSize: '12px',
                    letterSpacing: '2px', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  ⚔️ Next Duel
                </button>
              </div>
            )}
          </div>
        )}

        {/* LEADERBOARD VIEW */}
        {view === 'leaderboard' && (
          <div style={{ padding: '32px 36px' }}>
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: '#7a7070', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '24px' }}>
              Top 10 — Most Voted Films
            </p>
            {leaderboard.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#7a7070', fontFamily: "'Outfit', sans-serif", fontSize: '13px' }}>
                No votes yet — start dueling! ⚔️
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {leaderboard.map((film, i) => (
                <div key={film.imdb_id} style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  background: i === 0 ? 'rgba(201,168,76,0.08)' : 'rgba(255,255,255,0.03)',
                  border: i === 0 ? '1px solid rgba(201,168,76,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px', padding: '12px 16px',
                }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: i === 0 ? '#c9a84c' : '#3a3535', width: '32px', textAlign: 'center' }}>
                    {i === 0 ? '👑' : i + 1}
                  </div>
                  <img src={film.poster_url} alt={film.title} style={{ width: '36px', height: '54px', objectFit: 'cover', borderRadius: '3px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '16px', fontWeight: 600, color: '#f0ebe3', marginBottom: '4px' }}>{film.title}</div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: '#27ae60' }}>✓ {film.wins} wins</span>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: '#7a7070' }}>✗ {film.losses} losses</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '20px', fontWeight: 700, color: i === 0 ? '#c9a84c' : '#f0ebe3' }}>
                      {winRate(film.wins, film.losses)}%
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', color: '#7a7070', letterSpacing: '1px' }}>WIN RATE</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}