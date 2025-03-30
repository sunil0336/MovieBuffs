"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiTrash, FiAlertCircle } from "react-icons/fi"
import Header from "../components/Header"
import MovieCard from "../components/MovieCard"
import api from "../services/api"

const WatchlistPage = () => {
  const [watchlist, setWatchlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await api.get("/users/watchlist")
        setWatchlist(res.data.watchlist)
      } catch (err) {
        setError("Failed to load watchlist")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlist()
  }, [])

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      await api.delete(`/users/watchlist/${movieId}`)
      setWatchlist(watchlist.filter((movie) => movie._id !== movieId))
    } catch (err) {
      console.error("Error removing from watchlist:", err)
    }
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Watchlist</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 text-white flex items-center">
            <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-purple-800/50 rounded-xl mb-2"></div>
                <div className="h-4 bg-purple-800/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-purple-800/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : watchlist.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlist.map((movie) => (
              <div key={movie._id} className="relative group">
                <MovieCard movie={movie} variant="poster" />
                <button
                  onClick={() => handleRemoveFromWatchlist(movie._id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  title="Remove from watchlist"
                >
                  <FiTrash className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-purple-800/30 rounded-lg">
            <h2 className="text-xl font-medium mb-4">Your watchlist is empty</h2>
            <p className="text-gray-300 mb-6">Add movies to your watchlist to keep track of what you want to watch.</p>
            <Link to="/movies" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded inline-block">
              Browse Movies
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default WatchlistPage

