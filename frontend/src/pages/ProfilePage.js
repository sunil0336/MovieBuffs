"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiEdit2, FiStar, FiFilm, FiTv, FiUser, FiThumbsUp, FiThumbsDown, FiMessageSquare ,FiEye  } from "react-icons/fi"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import api from "../services/api"

const ProfilePage = () => {
  const { user } = useAuth()
  const [userReviews, setUserReviews] = useState({ movies: [], tvShows: [] })
  const [watchlist, setWatchlist] = useState({ movies: [], tvShows: [] })
  const [activeTab, setActiveTab] = useState("reviews")
  const [activeReviewsTab, setActiveReviewsTab] = useState("movies")
  const [loading, setLoading] = useState(true)
  const [watchlistLoading, setWatchlistLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserReviews()
      fetchWatchlist()
    }
  }, [user])

  const fetchUserReviews = async () => {
    setLoading(true)
    try {
      // UPDATED: Fetch both movie and TV show reviews
      const [movieReviewsRes, tvShowReviewsRes] = await Promise.all([
        api.get(`/reviews/user/${user.id}`),
        api.get(`/tvshowreviews/user/${user.id}`),
      ])

      setUserReviews({
        movies: movieReviewsRes.data.reviews || [],
        tvShows: tvShowReviewsRes.data.reviews || [],
      })
    } catch (error) {
      console.error("Error fetching user reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWatchlist = async () => {
    setWatchlistLoading(true)
    try {
      const res = await api.get("/users/watchlist")
      setWatchlist({
        movies: res.data.movies || [],
        tvShows: res.data.tvShows || [],
      })
    } catch (error) {
      console.error("Error fetching watchlist:", error)
    } finally {
      setWatchlistLoading(false)
    }
  }

  const removeFromWatchlist = async (id, type) => {
    try {
      await api.delete(`/users/watchlist/${id}`)

      // Update local state
      if (type === "movie") {
        setWatchlist({
          ...watchlist,
          movies: watchlist.movies.filter((movie) => movie._id !== id),
        })
      } else {
        setWatchlist({
          ...watchlist,
          tvShows: watchlist.tvShows.filter((tvShow) => tvShow._id !== id),
        })
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-purple-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Link to="/login" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  // UPDATED: Added renderReview function to handle both movie and TV show reviews
  const renderReview = (review, type) => {
    const isMovie = type === "movie"
    const contentId = isMovie ? review.movieId?._id : review.tvShowId?._id
    const contentTitle = isMovie ? review.movieId?.title : review.tvShowId?.title
    const contentPoster = isMovie ? review.movieId?.poster : review.tvShowId?.poster
    const contentLink = isMovie ? `/movies/${contentId}` : `/tv-shows/${contentId}`

    return (
      <div key={review._id} className="bg-purple-800/50 rounded-lg p-6">
        <div className="flex gap-4">
          <Link to={contentLink} className="flex-shrink-0">
            <div className="w-16 h-24 bg-purple-800 rounded overflow-hidden">
              {contentPoster && (
                <img
                  src={contentPoster || "/placeholder.svg"}
                  alt={contentTitle}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </Link>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <Link to={contentLink} className="hover:text-yellow-400">
                <h3 className="text-lg font-medium">{contentTitle || "Unknown Title"}</h3>
              </Link>

              <div className="flex items-center gap-1">
                <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-bold">{review.rating}</span>
                <span className="text-gray-400">/ 5</span>
              </div>
            </div>

            <h4 className="font-medium mb-2">{review.title}</h4>
            <p className="text-sm text-gray-300 mb-2">{review.content}</p>

            <div className="flex justify-between items-center text-sm text-gray-400">
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center text-sm text-gray-400">
                  <FiThumbsUp className="w-4 h-4 mr-1" />
                  {review.likes?.length || 0}
                </div>

                <div className="flex items-center text-sm text-gray-400">
                  <FiThumbsDown className="w-4 h-4 mr-1" />
                  {review.dislikes?.length || 0}
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <FiMessageSquare className="w-4 h-4 mr-1" />
                  {review.comments?.length || 0}
                </div>
                <Link to={contentLink} className="flex justify-center text-yellow-400 hover:underline">
                <FiEye className="w-4 h-4 mr-1" />
                  View
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="max-w-3xl mx-auto bg-purple-950 rounded-3xl p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative w-32 h-32 bg-purple-800 rounded-full flex items-center justify-center text-4xl font-bold">
              {user.profileImage ? (
                <img
                  src={user.profileImage || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="space-y-2 mb-6">
                <p className="text-lg font-medium">Name: {user.name}</p>
                <p className="text-gray-300">Email: {user.email}</p>
                <p className="text-gray-300">Username: {user.username}</p>
                {user.bio && <p className="text-gray-300">Bio: {user.bio}</p>}
              </div>

              <div className="flex justify-center gap-12 md:justify-start ">
                <Link
                  to="/profile/edit"
                  className="px-4 py-2 border border-white text-white hover:bg-purple-800 rounded flex items-center gap-2 w-fit mx-auto md:mx-0"
                >
                  <FiEdit2 className="w-4 h-4" />
                  Edit profile
                </Link>
                {user.role === "admin" ? <Link
                  to="/admin"
                  className="px-4 py-2 border border-white text-white hover:bg-purple-800 rounded flex items-center gap-2 w-fit mx-auto md:mx-0"
                >
                  <FiUser className="w-4 h-4" />
                  Admin DashBoard
                </Link> : ""}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-3xl mx-auto">
          <div className="flex border-b border-purple-800 mb-6">
            <button
              className={`px-4 py-2 font-medium ${activeTab === "reviews" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-300"
                }`}
              onClick={() => setActiveTab("reviews")}
            >
              Your Reviews
            </button>
            <button
              className={`px-4 py-2 font-medium ${activeTab === "watchlist" ? "text-yellow-400 border-b-2 border-yellow-400" : "text-gray-300"
                }`}
              onClick={() => setActiveTab("watchlist")}
            >
              Watchlist
            </button>
          </div>

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Your Reviews</h2>

                {/* UPDATED: Added sub-tabs for movie and TV show reviews */}
                <div className="flex border border-purple-800 rounded-lg overflow-hidden">
                  <button
                    className={`px-4 py-1 flex items-center gap-1 ${activeReviewsTab === "movies" ? "bg-yellow-500 text-black" : "hover:bg-purple-800"
                      }`}
                    onClick={() => setActiveReviewsTab("movies")}
                  >
                    <FiFilm className="w-4 h-4" />
                    Movies
                  </button>
                  <button
                    className={`px-4 py-1 flex items-center gap-1 ${activeReviewsTab === "tvShows" ? "bg-yellow-500 text-black" : "hover:bg-purple-800"
                      }`}
                    onClick={() => setActiveReviewsTab("tvShows")}
                  >
                    <FiTv className="w-4 h-4" />
                    TV Shows
                  </button>
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
                <>
                  {/* UPDATED: Show either movie or TV show reviews based on active tab */}
                  {activeReviewsTab === "movies" && (
                    <>
                      {userReviews.movies.length > 0 ? (
                        <div className="space-y-6">
                          {userReviews.movies.map((review) => renderReview(review, "movie"))}
                        </div>
                      ) : (
                        <div className="bg-purple-800/50 rounded-lg p-8 text-center">
                          <h3 className="text-xl font-medium mb-4">You haven't written any movie reviews yet</h3>
                          <p className="text-gray-300 mb-6">Start sharing your thoughts on movies you've watched!</p>
                          <Link to="/movies" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                            Browse Movies
                          </Link>
                        </div>
                      )}
                    </>
                  )}

                  {activeReviewsTab === "tvShows" && (
                    <>
                      {userReviews.tvShows.length > 0 ? (
                        <div className="space-y-6">
                          {userReviews.tvShows.map((review) => renderReview(review, "tvShow"))}
                        </div>
                      ) : (
                        <div className="bg-purple-800/50 rounded-lg p-8 text-center">
                          <h3 className="text-xl font-medium mb-4">You haven't written any TV show reviews yet</h3>
                          <p className="text-gray-300 mb-6">Start sharing your thoughts on TV shows you've watched!</p>
                          <Link
                            to="/tv-shows"
                            className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded"
                          >
                            Browse TV Shows
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Watchlist Tab */}
          {activeTab === "watchlist" && (
            <div>
              <h2 className="text-xl font-bold mb-6">Your Watchlist</h2>

              {watchlistLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-purple-800/50 rounded-lg p-6 animate-pulse">
                      <div className="flex gap-4">
                        <div className="w-16 h-24 bg-purple-700 rounded"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-purple-700 rounded w-1/3 mb-2"></div>
                          <div className="h-4 bg-purple-700 rounded w-1/4 mb-4"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : watchlist.movies.length > 0 || watchlist.tvShows.length > 0 ? (
                <div>
                  {/* Movies in watchlist */}
                  {watchlist.movies.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <FiFilm className="w-5 h-5" />
                        Movies
                      </h3>
                      <div className="space-y-4">
                        {watchlist.movies.map((movie) => (
                          <div
                            key={movie._id}
                            className="bg-purple-800/50 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <Link to={`/movies/${movie._id}`} className="flex-shrink-0">
                                <div className="w-12 h-18 bg-purple-800 rounded overflow-hidden">
                                  {movie.poster && (
                                    <img
                                      src={movie.poster || "/placeholder.svg"}
                                      alt={movie.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              </Link>
                              <div>
                                <Link to={`/movies/${movie._id}`} className="font-medium hover:text-yellow-400">
                                  {movie.title}
                                </Link>
                                <p className="text-sm text-gray-400">
                                  {movie.year} • {movie.rating.toFixed(1)}/10
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromWatchlist(movie._id, "movie")}
                              className="text-red-400 hover:text-red-300"
                              title="Remove from watchlist"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TV Shows in watchlist */}
                  {watchlist.tvShows.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                        <FiTv className="w-5 h-5" />
                        TV Shows
                      </h3>
                      <div className="space-y-4">
                        {watchlist.tvShows.map((tvShow) => (
                          <div
                            key={tvShow._id}
                            className="bg-purple-800/50 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-4">
                              <Link to={`/tv-shows/${tvShow._id}`} className="flex-shrink-0">
                                <div className="w-12 h-18 bg-purple-800 rounded overflow-hidden">
                                  {tvShow.poster && (
                                    <img
                                      src={tvShow.poster || "/placeholder.svg"}
                                      alt={tvShow.title}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              </Link>
                              <div>
                                <Link to={`/tv-shows/${tvShow._id}`} className="font-medium hover:text-yellow-400">
                                  {tvShow.title}
                                </Link>
                                <p className="text-sm text-gray-400">
                                  {new Date(tvShow.firstAirDate).getFullYear()} • {tvShow.rating.toFixed(1)}/10
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromWatchlist(tvShow._id, "tvShow")}
                              className="text-red-400 hover:text-red-300"
                              title="Remove from watchlist"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-purple-800/50 rounded-lg p-8 text-center">
                  <h3 className="text-xl font-medium mb-4">Your watchlist is empty</h3>
                  <p className="text-gray-300 mb-6">
                    Add movies and TV shows to your watchlist to keep track of what you want to watch!
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link to="/movies" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                      Browse Movies
                    </Link>
                    <Link to="/tv-shows" className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded">
                      Browse TV Shows
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProfilePage
