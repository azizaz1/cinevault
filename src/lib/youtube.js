import axios from 'axios'

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

export const getTrailer = async (movieTitle, year) => {
  try {
    const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        key: API_KEY,
        q: `${movieTitle} ${year} official trailer`,
        part: 'snippet',
        type: 'video',
        maxResults: 1,
      }
    })
    const video = res.data.items[0]
    return video ? video.id.videoId : null
  } catch (err) {
    console.error(err)
    return null
  }
}