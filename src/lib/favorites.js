import { supabase } from './supabase'

// Ajouter aux favoris
export const addFavorite = async (userId, movie) => {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: userId,
      movie_imdb_id: movie.imdbID,
      movie_title: movie.Title,
      movie_poster: movie.Poster,
      movie_year: movie.Year,
      movie_rating: movie.imdbRating,
    })
  return { data, error }
}

// Supprimer des favoris
export const removeFavorite = async (userId, imdbId) => {
  const { data, error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('movie_imdb_id', imdbId)
  return { data, error }
}

// Vérifier si favori
export const isFavorite = async (userId, imdbId) => {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('movie_imdb_id', imdbId)
    .single()
  return !!data
}

// Récupérer tous les favoris
export const getFavorites = async (userId) => {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data, error }
}
