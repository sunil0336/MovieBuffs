"use client"

import { useState, useEffect } from "react"
import { FiBookmark } from "react-icons/fi"
import { useAuth } from "../contexts/AuthContext"
import api from "../services/api"

const WatchlistButton = ({ movieId }) => {
  const { user } = useAuth()
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkWatchlist = async () => {
      if (!user || !movieId) return

      try {
        const res = await api.get(`/users/watchlist/${movieId}/check`)
        setIsInWatchlist(res.data.isInWatchlist)
      } catch (error) {
        console.error("Error checking watchlist:", error)
      }
    }

    checkWatchlist()
  }, [user, movieId])

  const handleToggleWatchlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      // Redirect to login or show login modal
      return
    }

    setIsLoading(true)

    try {
      if (isInWatchlist) {
        await api.delete(`/users/watchlist/${movieId}`)
      } else {
        await api.put(`/users/watchlist/${movieId}`)
      }

      setIsInWatchlist(!isInWatchlist)
    } catch (error) {
      console.error("Error updating watchlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleWatchlist}
      disabled={isLoading}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        isInWatchlist ? "bg-yellow-500 hover:bg-yellow-600" : "bg-black/40 backdrop-blur-sm hover:bg-purple-700"
      }`}
      title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      <FiBookmark className={`w-4 h-4 ${isInWatchlist ? "text-black fill-black" : "text-white"}`} />
    </button>
  )
}

export default WatchlistButton
