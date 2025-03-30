"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiTrash, FiEye, FiSearch, FiFilter, FiX } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"
import { formatDate } from "../../utils/formatters"

const AdminReviewsPage = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })
  const [filters, setFilters] = useState({
    search: "",
    minRating: "",
    sort: "newest",
  })

  const fetchReviews = async (page = 1) => {
    try {
      setLoading(true)

      let queryParams = `page=${page}&limit=10`
      if (filters.search) queryParams += `&search=${filters.search}`
      if (filters.minRating) queryParams += `&minRating=${filters.minRating}`
      if (filters.sort) queryParams += `&sort=${filters.sort}`

      const res = await api.get(`/admin/reviews?${queryParams}`)

      setReviews(res.data.reviews)
      setPagination({
        page: res.data.pagination.page,
        pages: res.data.pagination.pages,
        total: res.data.pagination.total,
      })
    } catch (err) {
      setError("Failed to load reviews")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const handlePageChange = (newPage) => {
    fetchReviews(newPage)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchReviews(1)
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      minRating: "",
      sort: "newest",
    })
    fetchReviews(1)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return

    try {
      await api.delete(`/reviews/${reviewId}`)
      setReviews(reviews.filter((review) => review._id !== reviewId))
      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }))
    } catch (err) {
      console.error("Error deleting review:", err)
      alert("Failed to delete review")
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Reviews</h1>
        <div className="text-sm text-gray-300">Total: {pagination.total} reviews</div>
      </div>

      <div className="bg-purple-800 rounded-lg p-4 mb-6">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title or content..."
                  className="w-full p-2 pl-8 bg-purple-900 border border-purple-700 rounded text-white"
                />
                <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>

            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Min Rating</label>
              <select
                name="minRating"
                value={filters.minRating}
                onChange={handleFilterChange}
                className="w-full p-2 bg-purple-900 border border-purple-700 rounded text-white"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5</option>
              </select>
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full p-2 bg-purple-900 border border-purple-700 rounded text-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
                <option value="mostLiked">Most Liked</option>
                <option value="mostHelpful">Most Helpful</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm bg-purple-700 hover:bg-purple-600 rounded flex items-center"
            >
              <FiX className="mr-1" /> Clear Filters
            </button>

            <button
              type="submit"
              className="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center"
            >
              <FiFilter className="mr-1" /> Filter
            </button>
          </div>
        </form>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 text-white">{error}</div>}

      <div className="bg-purple-800 rounded-lg overflow-hidden shadow-lg mb-6">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-purple-700/50 rounded"></div>
              ))}
            </div>
          </div>
        ) : reviews.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/50 text-left">
                <tr>
                  <th className="p-4">Review</th>
                  <th className="p-4">Movie</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-700/30">
                {reviews.map((review) => (
                  <tr key={review._id} className="hover:bg-purple-700/30">
                    <td className="p-4">
                      <div className="max-w-xs">
                        <div className="font-medium truncate">{review.title}</div>
                        <div className="text-sm text-gray-300 truncate">{review.content.substring(0, 50)}...</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {review.likes?.length || 0} likes • {review.comments?.length || 0} comments
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Link to={`/movies/${review.movieId._id}`} className="hover:text-yellow-400">
                        {review.movieId.title}
                      </Link>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center">
                      {review.userId && review.userId.profileImage ? (

                          <img
                            src={review.userId.profileImage || "/placeholder.svg"}
                            // alt={review.userId.name}
                            alt="User Avatar"
                            className="w-8 h-8 rounded-full mr-2"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-purple-600 mr-2 flex items-center justify-center">
                            {/* {review.userId.name.charAt(0)} */}jj
{/* ////////////////////////////////////////////////////////////// */}
                          </div>
                        )}
                        <span>{/*review.userId.name*/}ha</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center text-yellow-400">{review.rating} / 5</div>
                    </td>
                    <td className="p-4 text-gray-300">{formatDate(review.createdAt)}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Link
                          to={`/reviews/${review._id}`}
                          className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded"
                          title="View Review"
                        >
                          <FiEye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteReview(review._id)}
                          className="p-1.5 bg-red-600 hover:bg-red-700 rounded"
                          title="Delete Review"
                        >
                          <FiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-300">No reviews found matching your criteria.</p>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <div className="px-3 py-1 bg-yellow-500 text-black rounded">
              {pagination.page} of {pagination.pages}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(pagination.pages)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminReviewsPage

