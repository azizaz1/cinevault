import { useState, useEffect } from 'react'
import { searchMovie } from './lib/omdb'
import { signOut, getUser } from './lib/auth'
import { supabase } from './lib/supabase'
import AuthModal from './components/AuthModal'
import { getTrailer } from './lib/youtube'
import AIRecommender from './components/AIRecommender'
import StarRating from './components/StarRating'
import FavoritesPanel from './components/FavoritesPanel'
import { addFavorite, removeFavorite, isFavorite } from './lib/favorites'
import FilmDuel from './components/FilmDuel'
import ActorPage from './components/ActorPage'
import ChatBot from './components/ChatBot'
import { getCachedMovie, getAllCachedMovies } from './lib/movieCache'
const POPULAR_MOVIES = [
  // Blockbusters récents
  'Oppenheimer', 'Dune Part Two', 'Poor Things', 'Barbie',
  'The Batman', 'Avatar The Way of Water', 'Killers of the Flower Moon',
  'Everything Everywhere All at Once', 'Top Gun Maverick', 'Elvis',
  'The Whale', 'Tar', 'Babylon', 'Black Panther Wakanda Forever',
  'Doctor Strange Multiverse of Madness', 'Thor Love and Thunder',
  'Spider-Man No Way Home', 'The Menu', 'Glass Onion', 'Nope',

  // Classiques modernes
  'Joker', 'Parasite', '1917', 'Ford v Ferrari',
  'Once Upon a Time in Hollywood', 'Knives Out', 'Marriage Story',
  'The Irishman', 'Jojo Rabbit', 'Little Women',
  'Midsommar', 'Hereditary', 'Get Out', 'Us', 'It Chapter Two',
  'Ad Astra', 'Uncut Gems', 'The Lighthouse', 'Booksmart', 'Rocketman',

  // Grands classiques
  'The Dark Knight', 'Inception', 'Interstellar', 'The Prestige',
  'Memento', 'Pulp Fiction', 'The Godfather', 'Goodfellas',
  'Fight Club', 'The Shawshank Redemption', 'Forrest Gump',
  'Schindlers List', 'The Silence of the Lambs', 'Se7en',
  'The Matrix', 'Gladiator', 'Braveheart', 'Saving Private Ryan',
  'American Beauty', 'A Beautiful Mind',

  // Action & Aventure
  'Mad Max Fury Road', 'John Wick', 'Mission Impossible Fallout',
  'Avengers Endgame', 'Avengers Infinity War', 'Black Panther',
  'Logan', 'Deadpool', 'Guardians of the Galaxy',
  'Captain America Civil War', 'The Revenant', 'Dunkirk',
  'Blade Runner 2049', 'Sicario', 'Hell or High Water',
  'No Country for Old Men', 'There Will Be Blood', 'Whiplash',
  'La La Land', 'Moonlight',

  // International
  'Drive My Car', 'The Power of the Dog', 'Nomadland',
  'Sound of Metal', 'Promising Young Woman', 'Minari',
  'Portrait of a Lady on Fire', 'Pain and Glory',
  'Shoplifters', 'Roma', 'Cold War', 'Capernaum',
  'Burning', 'The Father', 'Mank',

  // Horreur & Thriller
  'A Quiet Place', 'Bird Box', 'It', 'Doctor Sleep',
  'Ready or Not', 'The Invisible Man', 'Promising Young Woman',
  'Underwater', 'The Platform', 'His House',
  'Saint Maud', 'Possessor', 'The Hunt', 'Vivarium',
  'Color Out of Space', 'Antebellum', 'The Empty Man',
  'Candyman', 'Last Night in Soho', 'Spencer',

  // Comédie & Drame
  'The Grand Budapest Hotel', 'Superbad', 'Game Night',
  'Bridesmaids', 'The Big Sick', 'Blockers', 'Tag',
  'Long Shot', 'Stuber', 'Good Boys',
  'Booksmart', 'The Peanut Butter Falcon', 'Dolemite Is My Name',
  'Jojo Rabbit', 'The Death of Stalin', 'Sorry to Bother You',
  'Palm Springs', 'Bill and Ted Face the Music', 'Eurovision',

  // Science Fiction
  'Arrival', 'Ex Machina', 'The Martian', 'Gravity',
  'Annihilation', 'Upgrade', 'Alita Battle Angel',
  'Prospect', 'Vivarium', 'Archive',
  'Synchronic', 'Outside the Wire', 'Finch',
  'Oxygen', 'Settlers', 'The Midnight Sky',
  'Chaos Walking', 'Stowaway', 'Voyagers',

  // Animés
  'Spider-Man Into the Spider-Verse', 'Soul', 'Onward',
  'Wolfwalkers', 'The Mitchells vs the Machines',
  'Luca', 'Encanto', 'Turning Red',
  'The Bad Guys', 'Puss in Boots The Last Wish',
  'Guillermo del Toros Pinocchio', 'Marcel the Shell',
  'Flee', 'The House', 'Wendell and Wild',

  // Biopic & Histoire
  'Bohemian Rhapsody', 'Rocketman', 'Judy', 'Harriet',
  'Selena Gomez My Mind and Me', 'The Eyes of Tammy Faye',
  'Being the Ricardos', 'tick tick Boom',
  'Respect', 'I Carry You With Me', 'Passing',
  'The Dig', 'Rebecca', 'Ammonite',
  'The Personal History of David Copperfield',

  // Crime & Thriller
  'Prisoners', 'Gone Girl', 'Zodiac', 'Mystic River',
  'Nightcrawler', 'Sicario', 'Wind River', 'Three Billboards',
  'Widows', 'Bad Times at the El Royale', 'Ozark',
  'Knives Out', 'Parasite', 'The Gentlemen',
  'Tenet', 'Boss Level', 'Reminiscence',

  // Romance & Drame
  'Call Me by Your Name', 'Moonlight', 'Carol',
  'The Shape of Water', 'Phantom Thread', 'Darkest Hour',
  'The Favourite', 'If Beale Street Could Talk',
  'Marriage Story', 'The Two Popes', 'Waves',
  'First Cow', 'Minari', 'Another Round',
  'The Disciple', 'Quo Vadis Aida',

  // Action récente
  'The Gray Man', 'Extraction', 'Red Notice',
  'Army of the Dead', 'Zack Snyders Justice League',
  'The Suicide Squad', 'Black Widow', 'Shang-Chi',
  'Eternals', 'No Time to Die', 'F9 The Fast Saga',
  'Jungle Cruise', 'Free Guy', 'The Tomorrow War',
  'Snake Eyes', 'Mortal Kombat', 'Monster Hunter',

  // Films Netflix & Streaming
  'Bird Box', 'Bright', 'Okja', 'Mudbound',
  'Roma', 'The Two Popes', 'Marriage Story',
  'Mank', 'Malcolm and Marie', 'The Dig',
  'Army of Thieves', 'The Harder They Fall',
  'tick tick Boom', 'The Power of the Dog',
  'Don t Look Up', 'The Hand of God',

  // Classiques années 90-2000
  'The Sixth Sense', 'American History X', 'Requiem for a Dream',
  'Black Swan', 'Eternal Sunshine', 'Mulholland Drive',
  'Lost in Translation', 'Her', 'Arrival',
  'About Time', 'The Truman Show', 'Good Will Hunting',
  'Dead Poets Society', 'Rain Man', 'Philadelphia',
  'Schindler List', 'Braveheart', 'Titanic',

  // Documentaires
  'Free Solo', 'Apollo 11', 'American Factory',
  'The Last Dance', 'Tiger King', 'Making a Murderer',
  'Icarus', '13th', 'Won t You Be My Neighbor',
  'Three Identical Strangers', 'Where Is My Friend s House',
  'Collective', 'My Octopus Teacher', 'Summer of Soul',
  'Roadrunner Anthony Bourdain', 'The Rescue',

  // Films arabes & africains
  'Theeb', 'The Idol', 'Clash', 'Yomeddine',
  'Casablanca Beats', 'Adam', 'Papicha',
  'The Blue Caftan', 'Feathers', 'Rudy Habibi',

  // Films asiatiques
  'Train to Busan', 'The Wailing', 'A Tale of Two Sisters',
  'Oldboy', 'I Saw the Devil', 'The Host',
  'Mother', 'Poetry', 'Burning',
  'Memories of Murder', 'A Bittersweet Life',

  // Films européens
  'The Square', 'Force Majeure', 'The Hunt',
  'A Separation', 'Capernaum', 'Toni Erdmann',
  'Son of Saul', 'The Lobster', 'The Favourite',
  'Yorgos Lanthimos', 'Wild Tales', 'Embrace of the Serpent',

  // Films 2023-2024
  'Asteroid City', 'May December', 'Priscilla',
  'All of Us Strangers', 'Past Lives', 'The Zone of Interest',
  'Anatomy of a Fall', 'Monster', 'Perfect Days',
  'Society of the Snow', 'Origin', 'American Fiction',
  'Maestro', 'Nyad', 'Rustin',
  'The Color Purple', 'Wonka', 'Migration',
  'Aquaman Lost Kingdom', 'The Beekeeper',
  'Night Swim', 'Lisa Frankenstein',
  'Argylle', 'Bob Marley One Love', 'Madame Web',
  'Drive-Away Dolls', 'Cabrini', 'Immaculate',
  'Ghostbusters Frozen Empire', 'Civil War', 'Abigail',
  'The Fall Guy', 'Challengers', 'Furiosa',
  'Inside Out 2', 'A Quiet Place Day One',
  'Despicable Me 4', 'Twisters', 'Alien Romulus',
  'Deadpool and Wolverine', 'Borderlands',
  'Alien Romulus', 'Speak No Evil', 'Transformers One',
  'Joker Folie a Deux', 'Terrifier 3',
  'Venom The Last Dance', 'Red One',
  'Gladiator 2', 'Wicked', 'Moana 2',
  'Kraven the Hunter', 'Mufasa The Lion King',
]

const genres = ['All', 'Action', 'Drama', 'Sci-Fi', 'Comedy', 'Crime', 'Biography', 'Adventure']

export default function App() {
  const [movies, setMovies] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [heroIdx, setHeroIdx] = useState(0)
  const [user, setUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [trailer, setTrailer] = useState(null)
  const [loadingTrailer, setLoadingTrailer] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showFavorites, setShowFavorites] = useState(false)
  const [isFav, setIsFav] = useState(false)
  const [mounted, setMounted] = useState(false)
const [showDuel, setShowDuel] = useState(false)
const [showChat, setShowChat] = useState(false)
const [selectedActor, setSelectedActor] = useState(null)
  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
    const loadMovies = async () => {
      setLoading(true)
      try {
        // Check cache first
        const cached = await getAllCachedMovies()
        if (cached.length > 0) {
          console.log(`✅ Loaded ${cached.length} films from Supabase cache!`)
          setMovies(cached)
          setLoading(false)
          return
        }

        // Cache empty → fetch from OMDB by chunks
        console.log('📡 Fetching from OMDB...')
        const chunkSize = 20
        const chunks = []
        for (let i = 0; i < POPULAR_MOVIES.length; i += chunkSize) {
          chunks.push(POPULAR_MOVIES.slice(i, i + chunkSize))
        }

        let allMovies = []
        for (const chunk of chunks) {
          const results = await Promise.all(
            chunk.map(title => getCachedMovie(title))
          )
          const valid = results.filter(m => m.Response === 'True')
          allMovies = [...allMovies, ...valid]
          setMovies([...allMovies])
          await new Promise(r => setTimeout(r, 300))
        }
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    loadMovies()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setHeroIdx(i => (i + 1) % 3), 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    getUser().then(setUser)
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })
  }, [])

  useEffect(() => {
    if (user && selected?.imdbID) {
      isFavorite(user.id, selected.imdbID).then(setIsFav)
    } else {
      setIsFav(false)
    }
  }, [user, selected])

  const filtered = movies
    .filter(m => {
      if (filter === 'toprated') return parseFloat(m.imdbRating) >= 8.0
      if (filter === 'new') return parseInt(m.Year) >= 2022
      const matchGenre = filter === 'All' || m.Genre?.includes(filter)
      const matchSearch = m.Title?.toLowerCase().includes(search.toLowerCase()) ||
        m.Actors?.toLowerCase().includes(search.toLowerCase())
      return matchGenre && matchSearch
    })
    .sort((a, b) => {
      if (filter === 'toprated') return parseFloat(b.imdbRating) - parseFloat(a.imdbRating)
      if (filter === 'new') return parseInt(b.Year) - parseInt(a.Year)
      return 0
    })

  const hero = movies[heroIdx] || null

  return (
    <div style={{ minHeight: '100vh', background: '#080608', color: '#f0ebe3', fontFamily: 'Georgia, serif', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --gold: #c9a84c;
          --gold-dim: rgba(201,168,76,0.15);
          --red: #c0392b;
          --red-dim: rgba(192,57,43,0.15);
          --bg: #080608;
          --bg2: #0f0d10;
          --surface: #141014;
          --border: rgba(201,168,76,0.12);
          --text: #f0ebe3;
          --muted: #7a7070;
        }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(50px); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .fade-up { animation: fadeUp 0.7s cubic-bezier(.22,.68,0,1.2) both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.2s; }
        .fade-up-3 { animation-delay: 0.3s; }
        .fade-up-4 { animation-delay: 0.4s; }

        .movie-card {
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(.22,.68,0,1.2);
          background: var(--surface);
        }
        .movie-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(8,6,8,0.98) 0%, rgba(8,6,8,0.4) 50%, transparent 100%);
          z-index: 1;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .movie-card:hover { transform: translateY(-10px) scale(1.02); z-index: 10; }
        .movie-card:hover::before { opacity: 1; }
        .movie-card:hover .card-info { opacity: 1 !important; transform: translateY(0) !important; }
        .movie-card:hover .card-img { transform: scale(1.05); }
        .card-img { transition: transform 0.5s ease; width: 100%; display: block; }
        .card-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 20px 14px 14px; z-index: 2;
          opacity: 0; transform: translateY(10px);
          transition: all 0.3s;
        }

        .genre-pill {
          cursor: pointer; border: none;
          font-family: 'Outfit', sans-serif;
          transition: all 0.25s;
          letter-spacing: 0.5px;
        }

        .nav-link {
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: var(--muted);
          transition: color 0.2s;
          letter-spacing: 1px;
          text-transform: uppercase;
          font-weight: 500;
        }
        .nav-link:hover { color: var(--gold); }

        .modal-backdrop {
          position: fixed; inset: 0; z-index: 999;
          background: rgba(4,3,4,0.92);
          backdrop-filter: blur(20px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn 0.3s ease;
        }
        .modal-box {
          background: linear-gradient(160deg, #100e11 0%, #0a080b 100%);
          border: 1px solid var(--border);
          border-radius: 12px;
          max-width: 860px; width: 100%;
          overflow-y: auto; max-height: 92vh;
          animation: slideUp 0.4s cubic-bezier(.22,.68,0,1.2);
          box-shadow: 0 60px 120px rgba(0,0,0,0.8);
        }

        .btn-primary {
          background: var(--gold);
          color: #080608;
          border: none;
          font-family: 'Outfit', sans-serif;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: all 0.2s;
        }
        .btn-primary:hover { background: #d4b060; transform: translateY(-1px); }

        .btn-ghost {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--muted);
          font-family: 'Outfit', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-ghost:hover { border-color: var(--gold); color: var(--gold); }

        .search-bar {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 6px;
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          outline: none;
          transition: border 0.2s, background 0.2s;
        }
        .search-bar:focus {
          border-color: var(--gold);
          background: rgba(201,168,76,0.04);
        }
        .search-bar::placeholder { color: #3a3535; }

        .imdb-badge {
          background: #f5c518;
          color: #000;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .hero-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(100px, 18vw, 220px);
          font-weight: 300;
          line-height: 0.85;
          color: transparent;
          -webkit-text-stroke: 1px rgba(201,168,76,0.15);
          position: absolute;
          right: -10px;
          bottom: -20px;
          pointer-events: none;
          user-select: none;
        }

        .divider {
          width: 40px;
          height: 1px;
          background: var(--gold);
          margin: 16px 0;
        }

        .loading-spinner {
          width: 32px; height: 32px;
          border: 2px solid rgba(201,168,76,0.2);
          border-top-color: var(--gold);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        padding: '0 48px', height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,6,8,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        transition: 'all 0.5s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', border: '1.5px solid var(--gold)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px' }}>▶</span>
          </div>
          <div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, letterSpacing: '2px', color: '#f0ebe3' }}>CINE</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 300, letterSpacing: '2px', color: 'var(--gold)' }}>VAULT</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
         {['Movies', 'Top Rated', 'New'].map(l => (
  <span key={l} className="nav-link"
    onClick={() => {
      if (l === 'Top Rated') setFilter('toprated')
      else if (l === 'New') setFilter('new')
      else setFilter('All')
    }}
    style={{ color: filter === 'toprated' && l === 'Top Rated' ? 'var(--gold)' : filter === 'new' && l === 'New' ? 'var(--gold)' : '' }}
  >{l}</span>
))}
          <button onClick={() => setShowAI(true)} style={{
            background: 'transparent',
            border: '1px solid rgba(201,168,76,0.3)',
            color: 'var(--gold)',
            padding: '7px 16px', borderRadius: '3px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '11px', fontWeight: 600,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-dim)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
         >✦ AI Pick</button>
          <button onClick={() => setShowDuel(true)} style={{
            background: 'transparent',
            border: '1px solid rgba(192,57,43,0.3)',
            color: '#e74c3c',
            padding: '7px 16px', borderRadius: '3px',
            fontFamily: "'Outfit', sans-serif",
            fontSize: '11px', fontWeight: 600,
            letterSpacing: '1.5px', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(192,57,43,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >⚔️ Duel</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && (
            <>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>
                {user.email.split('@')[0]}
              </span>
              <button onClick={() => setShowFavorites(true)} style={{
                background: 'var(--red-dim)', border: '1px solid rgba(192,57,43,0.3)',
                color: '#e74c3c', padding: '7px 14px', borderRadius: '3px',
                fontFamily: "'Outfit', sans-serif", fontSize: '11px', fontWeight: 600,
                letterSpacing: '1px', cursor: 'pointer',
              }}>♥ SAVED</button>
            </>
          )}
          {user ? (
            <button onClick={() => signOut().then(() => setUser(null))} className="btn-ghost" style={{ padding: '7px 14px', borderRadius: '3px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Exit
            </button>
          ) : (
            <button onClick={() => setShowAuth(true)} className="btn-primary" style={{ padding: '8px 20px', borderRadius: '3px', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* HERO */}
      {hero && (
        <div style={{ position: 'relative', height: '100vh', minHeight: '600px', overflow: 'hidden', background: 'var(--bg)' }}>
          <img src={hero.Poster} alt="" style={{ position: 'absolute', right: 0, top: 0, height: '100%', width: '55%', objectFit: 'cover', objectPosition: 'center top', filter: 'brightness(0.35) saturate(0.6)' }} />
          <img src={hero.Poster} alt={hero.Title} style={{ position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)', height: '72%', maxHeight: '520px', borderRadius: '4px', boxShadow: '0 40px 100px rgba(0,0,0,0.9)', zIndex: 2, border: '1px solid rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(8,6,8,1) 40%, rgba(8,6,8,0.7) 65%, rgba(8,6,8,0.2) 100%)', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, rgba(8,6,8,1) 0%, transparent 100%)', zIndex: 1 }} />
          <div className="hero-number" style={{ zIndex: 1 }}>{heroIdx + 1}</div>

          <div style={{ position: 'absolute', bottom: '12%', left: '48px', maxWidth: '480px', zIndex: 3 }}>
            <div className={mounted ? 'fade-up fade-up-1' : ''}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{ width: '32px', height: '1px', background: 'var(--gold)' }} />
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase' }}>Featured Film</span>
              </div>
            </div>
            <div className={mounted ? 'fade-up fade-up-2' : ''}>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(42px, 6vw, 72px)', fontWeight: 600, lineHeight: 1.0, marginBottom: '8px', letterSpacing: '-1px' }}>
                {hero.Title}
              </h1>
            </div>
            <div className={mounted ? 'fade-up fade-up-3' : ''}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <span style={{ color: '#f5c518', fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '15px' }}>★ {hero.imdbRating}</span>
                <span style={{ color: '#2a2527' }}>|</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>{hero.Year}</span>
                <span style={{ color: '#2a2527' }}>|</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--muted)' }}>{hero.Runtime}</span>
              </div>
              <div className="divider" />
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', lineHeight: 1.75, color: '#8a8080', marginBottom: '32px', maxWidth: '400px' }}>
                {hero.Plot?.slice(0, 160)}...
              </p>
            </div>
            <div className={mounted ? 'fade-up fade-up-4' : ''} style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setSelected(hero)} className="btn-primary" style={{ padding: '14px 32px', borderRadius: '3px', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>
                ▶ View Details
              </button>
              <button className="btn-ghost" style={{ padding: '13px 24px', borderRadius: '3px', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                + Watchlist
              </button>
            </div>
          </div>

          <div style={{ position: 'absolute', bottom: '6%', left: '48px', display: 'flex', gap: '8px', zIndex: 3 }}>
            {[0,1,2].map(i => (
              <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i === heroIdx ? '32px' : '6px', height: '2px', borderRadius: '1px', background: i === heroIdx ? 'var(--gold)' : 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', transition: 'all 0.4s', padding: 0 }} />
            ))}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div style={{ background: 'var(--bg)', paddingTop: '60px' }}>
        <div style={{ padding: '0 48px 40px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '8px' }}>✦ Collection</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '40px', fontWeight: 600, letterSpacing: '-0.5px', lineHeight: 1 }}>
              {filter === 'All' ? 'All Films' : filter}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', fontSize: '13px', pointerEvents: 'none' }}>⌕</span>
              <input className="search-bar" placeholder="Search films, actors..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '10px 16px 10px 34px', width: '240px' }} />
            </div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>{filtered.length} titles</span>
          </div>
        </div>

        <div style={{ padding: '0 48px 48px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {genres.map(g => (
            <button key={g} className="genre-pill" onClick={() => setFilter(g)} style={{
              padding: '8px 18px', borderRadius: '2px', fontSize: '11px',
              fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
              background: filter === g ? 'var(--gold)' : 'transparent',
              color: filter === g ? '#080608' : 'var(--muted)',
              border: filter === g ? 'none' : '1px solid rgba(255,255,255,0.07)',
            }}>{g}</button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '100px 48px' }}>
            <div className="loading-spinner" style={{ marginBottom: '20px' }} />
            <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>Loading Collection</p>
          </div>
        )}

        {!loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: '2px', padding: '0 48px 100px' }}>
            {filtered.map((movie, i) => (
              <div key={i} className="movie-card" onClick={() => setSelected(movie)}>
                <img src={movie.Poster} alt={movie.Title} className="card-img" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover' }} onError={e => { e.target.style.background = 'var(--surface)'; e.target.style.minHeight = '280px' }} />
                <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 3 }}>
                  <span className="imdb-badge">★ {movie.imdbRating}</span>
                </div>
                <div className="card-info">
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '17px', fontWeight: 600, color: '#f0ebe3', marginBottom: '4px', lineHeight: 1.2 }}>{movie.Title}</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>{movie.Year} · {movie.Genre?.split(',')[0]}</div>
                  <div style={{ marginTop: '10px', display: 'inline-block', background: 'var(--gold)', color: '#080608', fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '1px' }}>View Film</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MOVIE MODAL */}
      {selected && (
        <div className="modal-backdrop" onClick={() => { setSelected(null); setTrailer(null) }}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', minHeight: '320px' }}>
              <div style={{ width: '220px', flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '12px 0 0 0' }}>
                <img src={selected.Poster} alt={selected.Title} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '320px' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 70%, rgba(10,8,11,1) 100%)' }} />
              </div>
              <div style={{ flex: 1, padding: '36px', position: 'relative' }}>
                <button onClick={() => { setSelected(null); setTrailer(null) }} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--muted)', width: '32px', height: '32px', borderRadius: '50%', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '3px', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '12px' }}>✦ Now Viewing</div>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 600, lineHeight: 1.05, marginBottom: '6px' }}>{selected.Title}</h2>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: 'var(--muted)', marginBottom: '20px', fontStyle: 'italic' }}>{selected.Director}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#f5c518', fontSize: '20px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>★ {selected.imdbRating}</span>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--muted)' }}>{selected.imdbVotes} votes</span>
                  {selected.Metascore !== 'N/A' && (
                    <div style={{ background: parseInt(selected.Metascore) >= 70 ? '#27ae60' : '#f39c12', color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '11px', padding: '3px 8px', borderRadius: '2px' }}>{selected.Metascore} MC</div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {[selected.Year, selected.Runtime, selected.Rated].filter(Boolean).map(t => (
                    <span key={t} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '4px 12px', borderRadius: '2px', fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>{t}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {selected.Genre?.split(', ').map(g => (
                    <span key={g} style={{ background: 'var(--gold-dim)', border: '1px solid rgba(201,168,76,0.2)', color: 'var(--gold)', padding: '4px 12px', borderRadius: '2px', fontFamily: "'Outfit', sans-serif", fontSize: '11px' }}>{g}</span>
                  ))}
                </div>
                {selected.Awards !== 'N/A' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: 'rgba(201,168,76,0.06)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: '4px' }}>
                    <span>🏆</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '12px', color: 'var(--gold)' }}>{selected.Awards}</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ height: '1px', background: 'var(--border)', margin: '0 36px' }} />

            <div style={{ padding: '28px 36px 36px' }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', lineHeight: 1.8, color: '#7a7070', marginBottom: '24px' }}>{selected.Plot}</p>
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: 600, letterSpacing: '2px', color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Cast</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selected.Actors?.split(', ').map(a => (
  <span
    key={a}
    onClick={() => setSelectedActor(a)}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      padding: '6px 14px', borderRadius: '2px',
      fontFamily: "'Outfit', sans-serif", fontSize: '12px',
      color: '#c0b8b0', cursor: 'pointer', transition: 'all 0.2s',
    }}
    onMouseEnter={e => { e.target.style.borderColor = 'rgba(201,168,76,0.4)'; e.target.style.color = '#c9a84c' }}
    onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; e.target.style.color = '#c0b8b0' }}
  >{a}</span>
))}
                </div>
              </div>
              <div style={{ marginBottom: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <StarRating movie={selected} user={user} />
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={async () => {
                    if (!user) { alert('Sign in to save favorites!'); return }
                    if (isFav) { await removeFavorite(user.id, selected.imdbID); setIsFav(false) }
                    else { await addFavorite(user.id, selected); setIsFav(true) }
                  }}
                  style={{
                    background: isFav ? 'var(--red-dim)' : 'rgba(255,255,255,0.04)',
                    border: isFav ? '1px solid rgba(192,57,43,0.3)' : '1px solid rgba(255,255,255,0.07)',
                    color: isFav ? '#e74c3c' : 'var(--muted)',
                    padding: '12px 22px', borderRadius: '3px',
                    fontFamily: "'Outfit', sans-serif", fontWeight: 600,
                    fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >{isFav ? '♥ Saved' : '♡ Save Film'}</button>

                {trailer ? (
                  <div style={{ width: '100%', marginTop: '16px', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <iframe width="100%" height="280" src={`https://www.youtube.com/embed/${trailer}?autoplay=1`} title="Trailer" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen />
                  </div>
                ) : (
                  <button
                    onClick={async () => { setLoadingTrailer(true); const id = await getTrailer(selected.Title, selected.Year); setTrailer(id); setLoadingTrailer(false) }}
                    disabled={loadingTrailer}
                    className="btn-primary"
                    style={{ padding: '12px 28px', borderRadius: '3px', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}
                  >{loadingTrailer ? '⏳ Loading...' : '▶ Watch Trailer'}</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} onSuccess={(u) => setUser(u)} />}
      {showAI && <AIRecommender onClose={() => setShowAI(false)} onSearch={(title) => setSearch(title)} />}
      {showFavorites && <FavoritesPanel user={user} onClose={() => setShowFavorites(false)} />}
{showDuel && (
  <FilmDuel
    movies={movies}
    onClose={() => setShowDuel(false)}
  />
)}
{/* CHAT BUTTON */}
<button
  onClick={() => setShowChat(!showChat)}
  style={{
    position: 'fixed', bottom: '24px', right: '24px',
    width: '56px', height: '56px',
    background: 'linear-gradient(135deg, #c9a84c, #8b6914)',
    border: 'none', borderRadius: '50%',
    fontSize: '24px', cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(201,168,76,0.4)',
    zIndex: showChat ? 0 : 9998,
    transition: 'all 0.3s',
    display: showChat ? 'none' : 'flex',
    alignItems: 'center', justifyContent: 'center',
  }}
>🎬</button>

{/* CHATBOT */}
{showChat && (
  <ChatBot onClose={() => setShowChat(false)} />
)}
{selectedActor && (
  <ActorPage
    actorName={selectedActor}
    allMovies={movies}
    onClose={() => setSelectedActor(null)}
    onSelectMovie={(movie) => {
      setSelected(movie)
      setSelectedActor(null)
    }}
  />
)}


      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 600, letterSpacing: '2px' }}>CINE</span>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '18px', fontWeight: 300, letterSpacing: '2px', color: 'var(--gold)' }}>VAULT</span>
          </div>
          <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--muted)' }}>The premium cinema experience</p>
        </div>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['Privacy', 'Terms', 'Contact', 'About'].map(l => (
            <span key={l} style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.color = 'var(--gold)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >{l}</span>
          ))}
        </div>
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '11px', color: '#3a3535' }}>© 2026 CineVault</p>
      </footer>
    </div>
  )
}
