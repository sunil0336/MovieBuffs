"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FiBookmark, FiStar } from "react-icons/fi"

const MovieCard = ({ movie, variant = "default" }) => {
  const [isBookmarked, setIsBookmarked] = useState(false)

  const toggleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
  }

  return (
    <Link to={`/movies/${movie._id}`} className="block">
      <div className="relative group rounded-xl overflow-hidden bg-purple-800/50 hover:bg-purple-800 transition-all">
        <div className={`relative ${variant === "poster" ? "aspect-[2/3]" : "aspect-video"}`}>
          <img src={movie.poster || "/placeholder.svg"} alt={movie.title} className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={toggleBookmark}
              className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
            >
              <FiBookmark className={`w-4 h-4 ${isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
            </button>
          </div>

          {movie.isNew && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-500 text-black px-2 py-0.5 text-xs font-medium rounded">New</span>
            </div>
          )}

          {variant === "default" && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 text-xs rounded">
                {movie.runtime ? `${movie.runtime} min` : "2h 15m"}
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-medium line-clamp-1">{movie.title}</h3>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm">{movie.rating?.toFixed(1) || "N/A"}</span>
            </div>

            <div className="flex flex-col text-xs text-purple-200">
              {movie.genres && <span>{movie.genres[0]}</span>}
              {movie.language && <span>{movie.language}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default MovieCard

