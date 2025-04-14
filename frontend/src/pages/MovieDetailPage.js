"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { FiStar, FiShare, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import Header from "../components/Header"
import ReviewCard from "../components/ReviewCard"
import ReviewForm from "../components/ReviewForm"

const MovieDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    sort: "newest",
    minRating: 0,
    hideSpoilers: false,
  })

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/movies/${id}`)

        if (!res.ok) {
          if (res.status === 404) {
            navigate("/404")
            return
          }
          throw new Error("Failed to fetch movie")
        }

        const data = await res.json()
        setMovie(data.movie)
      } catch (error) {
        console.error("Error fetching movie:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchMovie()
    }
  }, [id, navigate])

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true)
      try {
        const queryParams = new URLSearchParams({
          sort: filterOptions.sort,
          minRating: filterOptions.minRating,
          page: currentPage,
          limit: 5,
        })

        const res = await fetch(`${process.env.REACT_APP_API_URL}/movies/${id}/reviews?${queryParams.toString()}`)
        const data = await res.json()

        setReviews(data.reviews || [])
        setTotalPages(data.pagination?.pages || 1)
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setReviewsLoading(false)
      }
    }

    if (id) {
      fetchReviews()
    }
  }, [id, currentPage, filterOptions])

  // const handleFilterChange = (newFilters) => {
  //   setFilterOptions(newFilters)
  //   setCurrentPage(1) // Reset to first page when filters change
  // }

  const handleReviewAdded = (newReview) => {
    // Refresh reviews after adding a new one
    setReviews((prevReviews) => [newReview, ...prevReviews])
    setShowReviewForm(false)

    // Update movie rating in UI
    if (movie) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0) + newReview.rating
      const averageRating = totalRating / (reviews.length + 1)
      setMovie((prevMovie) => ({
        ...prevMovie,
        rating: averageRating,
      }))
    }
  }

  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    const shareLink = window.location.href;
    navigator.clipboard.writeText(shareLink)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => console.error("Error copying text: ", error));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-purple-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
          <Link to="/movies" className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded">
            Back to Movies
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <div className="bg-black/80 min-h-screen">
        {/* Movie Details Section */}
        <div className="relative">
          {movie.backdrop && (
            <div className="absolute inset-0 w-full h-full">
              <img
                // src={`/images/${movie.backdrop || "/placeholder.svg"}`}
                src={movie.backdrop || "/placeholder.svg"}
                alt={movie.title}
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            </div>
          )}

          <div className="container mx-auto px-4 py-8 relative">
            <div className="flex items-center gap-4 mb-6">
              <Link to="/movies" className="text-white hover:text-gray-300">
                <FiChevronLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-2xl md:text-3xl font-bold">{movie.title}</h1>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/3 lg:w-1/4">
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  <img
                    // src={`/images/${movie.poster || "/placeholder.svg?height=450&width=300"}`}
                    src={movie.poster || "/placeholder.svg?height=450&width=300"}


                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="text-sm bg-yellow-500 text-black px-2 py-0.5 rounded">{movie.year}</span>

                  {movie.runtime && <span className="text-sm text-gray-300">{movie.runtime} min</span>}

                  {movie.rating && (
                    <div className="flex items-center gap-1">
                      <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-bold">{movie.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genres &&
                    movie.genres.map((genre) => (
                      <Link
                        key={genre}
                        to={`/movies?genre=${encodeURIComponent(genre)}`}
                        className="text-sm bg-purple-800 hover:bg-purple-700 px-3 py-1 rounded-full"
                      >
                        {genre}
                      </Link>
                    ))}
                </div>

                <p className="text-gray-300 mb-6">{movie.plot || "No plot description available."}</p>

                <div className="mb-6">
                  {movie.director && (
                    <p className="mb-1">
                      <span className="text-gray-400">Director: </span>
                      <span>{movie.director}</span>
                    </p>
                  )}

                  {movie.cast && movie.cast.length > 0 && (
                    <p className="mb-1">
                      <span className="text-gray-400">Cast: </span>
                      <span>{movie.cast.join(", ")}</span>
                    </p>
                  )}

                  {movie.language && (
                    <p>
                      <span className="text-gray-400">Language: </span>
                      <span>{movie.language}</span>
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                    Watch Trailer
                  </button>


                  <button className="px-4 py-2 border border-white text-white hover:bg-purple-800 rounded"
                    onClick={handleShareClick}
                  >
                    <FiShare className="w-4 h-4 inline mr-2" />
                    Share
                  </button>


                  <button
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                  >
                    <FiStar className="w-4 h-4 inline mr-2" />
                    Write a Review
                  </button>
                  {copied && (
                    <div
                      className=" text-green-500"
                      style={{ position: "relative", top: "10px" }}
                    >
                      Link copied to clipboard!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showReviewForm && (
          <div className="container mx-auto px-4 py-8">
            <ReviewForm movieId={id} movieTitle={movie.title} onReviewAdded={handleReviewAdded} />
          </div>
        )}

        {/* Reviews Section */}
        <div className="container mx-auto px-4 py-8">
          <h2 className="text-xl font-medium mb-6">User Reviews</h2>

          {reviewsLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-black/40 rounded-lg p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-800 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-purple-800 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-purple-800 rounded w-1/3 mb-4"></div>
                      <div className="h-3 bg-purple-800 rounded w-full mb-2"></div>
                      <div className="h-3 bg-purple-800 rounded w-full mb-2"></div>
                      <div className="h-3 bg-purple-800 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review._id} review={review} />
              ))}

              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${currentPage === 1 ? "text-gray-500 cursor-not-allowed" : "text-white hover:bg-purple-800"
                    }`}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    className={`w-8 h-8 flex items-center justify-center rounded-full ${i + 1 === currentPage ? "bg-purple-700 hover:bg-purple-600" : "text-white hover:bg-purple-800"
                      }`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-full ${currentPage === totalPages ? "text-gray-500 cursor-not-allowed" : "text-white hover:bg-purple-800"
                    }`}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-black/40 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium mb-4">No reviews yet</h3>
              <p className="text-gray-300 mb-6">Be the first to review this movie!</p>
              <button
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded"
                onClick={() => setShowReviewForm(true)}
              >
                <FiStar className="w-4 h-4 inline mr-2" />
                Write a Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MovieDetailPage

