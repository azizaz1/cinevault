import axios from 'axios'

const API_KEY = 'b5252991'
const BASE_URL = 'https://www.omdbapi.com'

// Chercher un film par titre
export const searchMovie = async (title) => {
  const res = await axios.get(BASE_URL, {
    params: {
      apikey: API_KEY,
      t: title,
      plot: 'full'
    }
  })
  return res.data
}

// Chercher plusieurs films
export const searchMovies = async (query) => {
  const res = await axios.get(BASE_URL, {
    params: {
      apikey: API_KEY,
      s: query,
      type: 'movie'
    }
  })
  return res.data.Search || []
}