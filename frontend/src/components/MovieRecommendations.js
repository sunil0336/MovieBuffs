"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiStar } from "react-icons/fi"
import api from "../services/api"

const MovieRecommendations = ({ movieId, genres }) => {
    const [recommendations, setRecommendations] = useState([])
    const [loading, setLoading] = useState(true)
  
    useEffect(() => {
      const fetchRecommendations = async () => {
        if (!movieId || !genres || genres.length === 0) return
  
        setLoading(true)
        try {
          const res = await api.get(`/movies/recommendations/${movieId}?limit=6`)
  
          // Response is: { success: true, recommendations: [...] }
          const recommendedMovies = res.data.recommendations || []
  
          setRecommendations(recommendedMovies.slice(0, 5)) // optional: trim to 5
        } catch (error) {
          console.error("Error fetching recommendations:", error)
        } finally {
          setLoading(false)
        }
      }
  
      fetchRecommendations()
    }, [movieId, genres])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-medium mb-6">You Might Also Like</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-purple-800/50 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-[2/3] bg-purple-700"></div>
              <div className="p-3">
                <div className="h-4 bg-purple-700 rounded mb-2"></div>
                <div className="h-3 bg-purple-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (recommendations.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-medium mb-6">You Might Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {recommendations.map((movie) => (
          <Link
            key={movie._id}
            to={`/movies/${movie._id}`}
            className="bg-purple-800/50 rounded-lg overflow-hidden hover:bg-purple-700/50 transition-colors"
          >
            <div className="aspect-[2/3] relative">
              <img
                src={movie.poster || "/placeholder.svg?height=300&width=200"}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
              {movie.rating && (
                <div className="absolute top-2 right-2 bg-black/70 rounded-full p-1 flex items-center">
                  <FiStar className="w-3 h-3 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-xs font-bold">{movie.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{movie.title}</h3>
              <p className="text-xs text-gray-300">{movie.year}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default MovieRecommendations
