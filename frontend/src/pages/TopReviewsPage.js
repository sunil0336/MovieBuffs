import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiStar, FiThumbsUp, FiThumbsDown, FiMessageSquare } from "react-icons/fi"
import Header from "../components/Header"

const TopReviewsPage = () => {
  const [topReviews, setTopReviews] = useState([])
  const [recentReviews, setRecentReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("top")
  const [filter, setFilter] = useState("topRating")

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const [topRes, recentRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/reviews/top?limit=10&sort=${filter}`),
          fetch(`${process.env.REACT_APP_API_URL}/reviews?sort=newest&limit=10`),
        ])

        const [topData, recentData] = await Promise.all([topRes.json(), recentRes.json()])

        setTopReviews(topData.reviews || [])
        setRecentReviews(recentData.reviews || [])
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [filter])

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Top Reviews</h1>
        <div className="mb-6 border-b border-purple-800">
          <div className="flex justify-between items-center">
            <div className="flex">
              <button
                className={`px-4 py-2 ${activeTab === "top" ? "border-b-2 border-yellow-500 text-yellow-500" : "text-white"}`}
                onClick={() => setActiveTab("top")}
              >
                Most Helpful
              </button>
              <button
                className={`px-4 py-2 ${activeTab === "recent" ? "border-b-2 border-yellow-500 text-yellow-500" : "text-white"}`}
                onClick={() => setActiveTab("recent")}
              >
                Recent Reviews
              </button>
            </div>

            {/* UPDATED: Added filter dropdown */}
            {activeTab === "top" && (
              <div className="flex items-center">
                <label htmlFor="filter" className="mr-2 text-sm">
                  Filter by:
                </label>
                <select
                  id="filter"
                  value={filter}
                  onChange={handleFilterChange}
                  className="p-2 bg-purple-800 border border-purple-700 rounded text-white"
                >
                  <option value="topRating">Top Rating</option>
                  <option value="mostLiked">Most Liked</option>
                  <option value="mostDisliked">Most Disliked</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-purple-800/50 rounded-lg p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-24 bg-purple-700 rounded"></div>
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
        ) : (
          <div className="space-y-6">
            {(activeTab === "top" ? topReviews : recentReviews).map((review) => (
              <div key={review._id} className="bg-purple-800/50 rounded-lg p-6">
                <div className="flex gap-4">
                  <Link to={`/movies/${review.movieId._id}`} className="flex-shrink-0">
                    <div className="w-16 h-24 bg-purple-800 rounded overflow-hidden">
                      {review.movieId?.poster && (
                        <img
                          src={review.movieId.poster || "/placeholder.svg"}
                          alt={review.movieId.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <Link to={`/movies/${review.movieId._id}`} className="hover:text-yellow-400">
                        <h3 className="text-lg font-medium">{review.movieId?.title || "Unknown Movie"}</h3>
                      </Link>

                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < Math.round(review.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="font-medium mb-2">{review.title}</h4>

                    <p className="text-sm text-gray-300 mb-4 line-clamp-3">{review.content}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-400">
                        By {review.userId?.name || "Anonymous"} • {formatDate(review.createdAt)}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-sm text-gray-400">
                          <FiThumbsUp className="w-4 h-4 mr-1" />
                          {review.likes?.length || 0}
                        </div>

                        {/* UPDATED: Added dislikes count */}
                        <div className="flex items-center text-sm text-gray-400">
                          <FiThumbsDown className="w-4 h-4 mr-1" />
                          {review.dislikes?.length || 0}
                        </div>

                        <div className="flex items-center text-sm text-gray-400">
                          <FiMessageSquare className="w-4 h-4 mr-1" />
                          {review.comments?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {(activeTab === "top" ? topReviews : recentReviews).length === 0 && (
              <div className="text-center py-12 text-gray-400">No reviews found</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default TopReviewsPage
