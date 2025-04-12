import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { FiBookmark, FiCheck } from "react-icons/fi"
import { AuthContext } from "../contexts/AuthContext"
import api from "../services/api"

const WatchlistButton = ({ movieId, tvShowId }) => {
  const { user, isAuthenticated } = useContext(AuthContext)
  const navigate = useNavigate()
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      checkWatchlistStatus()
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user, movieId, tvShowId])

  const checkWatchlistStatus = async () => {
    setLoading(true)
    try {
      const endpoint = "/users/watchlist/check"
      const params = {}

      if (movieId) {
        params.movieId = movieId
      } else if (tvShowId) {
        params.tvShowId = tvShowId
      }

      const res = await api.get(endpoint, { params })
      setIsInWatchlist(res.data.isInWatchlist)
    } catch (error) {
      console.error("Error checking watchlist status:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWatchlist = async () => {
    if (!isAuthenticated) {
      navigate("/login")
      return
    }

    setUpdating(true)
    try {
      const endpoint = isInWatchlist ? "/users/watchlist/remove" : "/users/watchlist/add"
      const data = {}

      if (movieId) {
        data.movieId = movieId
      } else if (tvShowId) {
        data.tvShowId = tvShowId
      }

      await api.post(endpoint, data)
      setIsInWatchlist(!isInWatchlist)
    } catch (error) {
      console.error("Error updating watchlist:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <button
        disabled
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-800 rounded-lg opacity-50"
      >
        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
        Loading...
      </button>
    )
  }

  return (
    <button
      onClick={toggleWatchlist}
      disabled={updating}
      className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
        isInWatchlist ? "bg-green-600 hover:bg-green-700" : "bg-yellow-500 hover:bg-yellow-600 text-black"
      } ${updating ? "opacity-50" : ""}`}
    >
      {updating ? (
        <div className="animate-spin h-4 w-4 border-2 border-current rounded-full border-t-transparent"></div>
      ) : isInWatchlist ? (
        <FiCheck className="w-4 h-4" />
      ) : (
        <FiBookmark className="w-4 h-4" />
      )}
      {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
    </button>
  )
}

export default WatchlistButton
