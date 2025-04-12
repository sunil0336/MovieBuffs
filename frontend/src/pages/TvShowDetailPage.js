
import { useState, useEffect, useContext } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiStar, FiCalendar, FiClock, FiFilm, FiUsers, FiShare2 } from "react-icons/fi"
import Header from "../components/Header"
import ReviewForm from "../components/ReviewForm"
import ReviewCard from "../components/ReviewCard"
import WatchlistButton from "../components/WatchlistButton"
import ShareModal from "../components/ShareModal"
import CommentSection from "../components/CommentSection"
import { AuthContext } from "../contexts/AuthContext"
import api from "../services/api"

const TvShowDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const [tvShow, setTvShow] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewSort, setReviewSort] = useState("newest")
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [selectedReview, setSelectedReview] = useState(null)

  useEffect(() => {
    fetchTvShow()
    fetchReviews()
  }, [id, reviewSort])

//   const fetchTvShow = async () => {
//     setLoading(true)
//     try {
//       const res = await api.get(`/tv-shows/${id}`)
//       setTvShow(res.data.tvshow)
//     } catch (error) {
//       console.error("Error fetching TV show:", error)
//     } finally {
//       setLoading(false)
//     }
//   }

const fetchTvShow = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/tvshows/${id}`)

      if (!res.ok) {
        if (res.status === 404) {
          navigate("/404")
          return
        }
        throw new Error("Failed to fetch TV show")
      }

      const data = await res.json()
      setTvShow(data.tvshow)
    } catch (error) {
      console.error("Error fetching TV show:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviews = async () => {
    setReviewsLoading(true)
    try {
      const res = await api.get(`/tvshows/${id}/reviews?sort=${reviewSort}`)
      setReviews(res.data.reviews)
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setReviewsLoading(false)
    }
  }

  const handleReviewAdded = (newReview) => {
    setReviews([newReview, ...reviews])
    fetchTvShow() // Refresh to get updated rating
  }

  const handleReviewDeleted = (reviewId) => {
    setReviews(reviews.filter((review) => review._id !== reviewId))
    fetchTvShow() // Refresh to get updated rating
  }

  const handleReviewUpdated = (updatedReview) => {
    setReviews(reviews.map((review) => (review._id === updatedReview._id ? updatedReview : review)))
  }

  const handleSortChange = (e) => {
    setReviewSort(e.target.value)
  }

  const openShareModal = (review = null) => {
    setSelectedReview(review)
    setShareModalOpen(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-[400px] bg-purple-800/50 rounded-xl mb-8"></div>
            <div className="h-8 bg-purple-800/50 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-purple-800/50 rounded w-1/4 mb-8"></div>
            <div className="h-32 bg-purple-800/50 rounded mb-8"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen bg-purple-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">TV Show not found</h1>
          <p className="text-gray-300">The TV show you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />

      {/* Backdrop */}
      {tvShow.backdrop && (
        <div className="relative h-[400px] w-full">
          <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/80 to-transparent"></div>
          <img src={tvShow.backdrop || "/placeholder.svg"} alt={tvShow.title} className="w-full h-full object-cover" />
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster and Info */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="bg-purple-800 rounded-lg overflow-hidden mb-6">
              <img src={tvShow.poster || "/placeholder.svg"} alt={tvShow.title} className="w-full h-auto" />
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Rating</h3>
                <div className="flex items-center gap-2">
                  <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  <span className="text-xl font-bold">{tvShow.rating?.toFixed(1) || "N/A"}</span>
                  <span className="text-gray-400">/10</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Details</h3>
                <ul className="space-y-2">
                  {tvShow.releaseDate && (
                    <li className="flex items-center gap-2">
                      <FiCalendar className="w-4 h-4 text-gray-400" />
                      <span>First aired: {new Date(tvShow.releaseDate).toLocaleDateString()}</span>
                    </li>
                  )}
                  {tvShow.status && (
                    <li className="flex items-center gap-2">
                      <FiFilm className="w-4 h-4 text-gray-400" />
                      <span>Status: {tvShow.status}</span>
                    </li>
                  )}
                  {tvShow.episodeRunTime && (
                    <li className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-gray-400" />
                      <span>Episode length: {tvShow.episodeRunTime} min</span>
                    </li>
                  )}
                  {tvShow.seasons && (
                    <li className="flex items-center gap-2">
                      <FiFilm className="w-4 h-4 text-gray-400" />
                      <span>Seasons: {tvShow.seasons}</span>
                    </li>
                  )}
                  {tvShow.episodes && (
                    <li className="flex items-center gap-2">
                      <FiFilm className="w-4 h-4 text-gray-400" />
                      <span>Episodes: {tvShow.episodes}</span>
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {tvShow.genres &&
                    tvShow.genres.map((genre) => (
                      <span key={genre} className="px-3 py-1 bg-purple-800 rounded-full text-sm">
                        {genre}
                      </span>
                    ))}
                </div>
              </div>

              <div className="pt-4 space-y-2">
                <WatchlistButton tvShowId={tvShow._id} />
                <button
                  onClick={() => openShareModal()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  <FiShare2 className="w-4 h-4" />
                  Share TV Show
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-2/3 lg:w-3/4">
            <h1 className="text-3xl font-bold mb-2">{tvShow.title}</h1>

            {tvShow.creator && <p className="text-gray-300 mb-6">Created by {tvShow.creator}</p>}

            <div className="mb-8">
              <h2 className="text-xl font-medium mb-4">Overview</h2>
              <p className="text-gray-200 leading-relaxed">{tvShow.plot}</p>
            </div>

            {tvShow.cast && tvShow.cast.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-4">Cast</h2>
                <div className="flex items-center gap-2">
                  <FiUsers className="w-5 h-5 text-gray-400" />
                  <p className="text-gray-200">{tvShow.cast.join(", ")}</p>
                </div>
              </div>
            )}

            {/* {tvShow.trailer && (
              <div className="mb-8">
                <h2 className="text-xl font-medium mb-4">Trailer</h2>
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${tvShow.trailer.split("v=")[1]}`}
                    title={`${tvShow.title} Trailer`}
                    className="w-full h-full"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )} */}

            {/* Reviews Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-medium">Reviews</h2>
                <select
                  value={reviewSort}
                  onChange={handleSortChange}
                  className="px-3 py-1 bg-purple-800 rounded-lg text-sm"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                  <option value="mostHelpful">Most Helpful</option>
                </select>
              </div>

              {user ? (
                <ReviewForm tvShowId={tvShow._id} tvShowTitle={tvShow.title} onReviewAdded={handleReviewAdded} />
              ) : (
                <div className="bg-purple-800/50 rounded-lg p-6 text-center mb-8">
                  <h3 className="text-xl font-medium mb-2">Want to leave a review?</h3>
                  <p className="text-gray-300 mb-4">Sign in to share your thoughts about this TV show.</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="mt-8 space-y-6">
                {reviewsLoading ? (
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-purple-800/50 rounded-lg p-6 animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-purple-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-5 bg-purple-700 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-purple-700 rounded w-1/4 mb-4"></div>
                            <div className="h-3 bg-purple-700 rounded w-full mb-2"></div>
                            <div className="h-3 bg-purple-700 rounded w-full mb-2"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review._id} className="space-y-4">
                      <ReviewCard
                        review={review}
                        onDelete={handleReviewDeleted}
                        onUpdate={handleReviewUpdated}
                        onShare={() => openShareModal(review)}
                      />
                      <CommentSection reviewId={review._id} />
                    </div>
                  ))
                ) : (
                  <div className="bg-purple-800/50 rounded-lg p-6 text-center">
                    <h3 className="text-xl font-medium mb-2">No reviews yet</h3>
                    <p className="text-gray-300">Be the first to review this TV show!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        item={selectedReview || tvShow}
        type={selectedReview ? "review" : "tvshow"}
      />
    </div>
  )
}

export default TvShowDetailPage
