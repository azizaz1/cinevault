import { supabase } from './supabase'
import { searchMovie } from './omdb'

// Format DB row to OMDB format
const formatMovie = (d) => ({
  Title: d.title,
  Year: d.year,
  Rated: d.rated,
  Runtime: d.runtime,
  Genre: d.genre,
  Director: d.director,
  Actors: d.actors,
  Plot: d.plot,
  Poster: d.poster,
  imdbRating: d.imdb_rating,
  imdbVotes: d.imdb_votes,
  Metascore: d.metascore,
  Awards: d.awards,
  Language: d.language,
  BoxOffice: d.box_office,
  imdbID: d.imdb_id,
  Response: 'True',
})

// Get single movie — cache first
export const getCachedMovie = async (title) => {
  try {
    const { data } = await supabase
      .from('cached_movies')
      .select('*')
      .ilike('title', `%${title}%`)
      .limit(1)

    if (data && data.length > 0) {
      console.log(`✅ Cache hit: ${title}`)
      return formatMovie(data[0])
    }

    // Not in cache → fetch from OMDB
    console.log(`📡 Fetching from OMDB: ${title}`)
    const movie = await searchMovie(title)
    if (movie.Response === 'True') {
      await saveToCache(movie)
    }
    return movie

  } catch (err) {
    console.error('Cache error:', err)
    const movie = await searchMovie(title)
    if (movie.Response === 'True') {
      await saveToCache(movie)
    }
    return movie
  }
}

// Save movie to Supabase cache
export const saveToCache = async (movie) => {
  try {
    const { error } = await supabase.from('cached_movies').upsert({
      imdb_id: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      rated: movie.Rated,
      runtime: movie.Runtime,
      genre: movie.Genre,
      director: movie.Director,
      actors: movie.Actors,
      plot: movie.Plot,
      poster: movie.Poster,
      imdb_rating: movie.imdbRating,
      imdb_votes: movie.imdbVotes,
      metascore: movie.Metascore,
      awards: movie.Awards,
      language: movie.Language,
      box_office: movie.BoxOffice,
      response: movie.Response,
    }, { onConflict: 'imdb_id' })

    if (error) console.error('Save error:', error)
    else console.log(`💾 Cached: ${movie.Title}`)
  } catch (err) {
    console.error('Cache save error:', err)
  }
}

// Get all cached movies
export const getAllCachedMovies = async () => {
  try {
    const { data, error } = await supabase
      .from('cached_movies')
      .select('*')
      .order('imdb_rating', { ascending: false })

    if (error) {
      console.error('Get all error:', error)
      return []
    }

    console.log(`✅ Loaded ${data?.length || 0} films from Supabase cache!`)
    return data?.map(d => formatMovie(d)) || []
  } catch (err) {
    console.error('getAllCachedMovies error:', err)
    return []
  }
}