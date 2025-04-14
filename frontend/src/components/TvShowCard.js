import { useState } from "react"
import { Link } from "react-router-dom"
import { FiBookmark, FiStar } from "react-icons/fi"

const TVShowCard = ({ tvshow, variant = "default" }) => {
  const [isBookmarked, setIsBookmarked] = useState(false)

  const toggleBookmark = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsBookmarked((prev) => !prev)
  }

  return (
    <Link to={`/tv-shows/${tvshow._id}`} className="block">
      <div className="relative group rounded-xl overflow-hidden bg-purple-800/50 hover:bg-purple-800 transition-all">
        <div className={`relative ${variant === "poster" ? "aspect-[2/3]" : "aspect-video"}`}>
          <img src={tvshow.poster || "/placeholder.svg"} alt={tvshow.title} className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="absolute top-2 right-2 z-5">
            <button
              onClick={toggleBookmark}
              className="w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
            >
              <FiBookmark className={`w-4 h-4 ${isBookmarked ? "text-yellow-400 fill-yellow-400" : "text-white"}`} />
            </button>
          </div>

          {tvshow.isNew && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-500 text-black px-2 py-0.5 text-xs font-medium rounded">New</span>
            </div>
          )}

          {variant === "default" && (
            <div className="absolute bottom-2 right-2">
              <span className="bg-black/40 backdrop-blur-sm text-white px-2 py-0.5 text-xs rounded">
                {tvshow.numberOfSeasons
                  ? `${tvshow.numberOfSeasons} Season${tvshow.numberOfSeasons > 1 ? "s" : ""}`
                  : "1 Season"}
              </span>
            </div>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-medium line-clamp-1">{tvshow.title}</h3>

          <div className="flex items-center justify-between mt-1">
            <div className="flex items-center">
              <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
              <span className="text-sm">{tvshow.rating?.toFixed(1) || "N/A"}</span>
            </div>

            <div className="flex flex-col text-xs text-purple-200">
              {tvshow.genres?.[0] && <span>{tvshow.genres[0]}</span>}
              {tvshow.firstAirDate && <span>{new Date(tvshow.firstAirDate).getFullYear()}</span>}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default TVShowCard
