import { supabase } from './supabase'

// Sauvegarder une note
export const saveRating = async (userId, movie, rating) => {
  const { data, error } = await supabase
    .from('ratings')
    .upsert({
      user_id: userId,
      movie_imdb_id: movie.imdbID,
      movie_title: movie.Title,
      rating: rating,
    }, { onConflict: 'user_id,movie_imdb_id' })
  return { data, error }
}

// Récupérer la note d'un film
export const getRating = async (userId, imdbId) => {
  const { data, error } = await supabase
    .from('ratings')
    .select('rating')
    .eq('user_id', userId)
    .eq('movie_imdb_id', imdbId)
    .single()
  return { data, error }
}

// Récupérer toutes les notes d'un user
export const getAllRatings = async (userId) => {
  const { data, error } = await supabase
    .from('ratings')
    .select('*')
    .eq('user_id', userId)
  return { data, error }
}
