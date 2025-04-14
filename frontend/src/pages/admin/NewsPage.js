"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiCalendar, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"

const NewsPage = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()

        if (searchTerm) queryParams.append("search", searchTerm)
        queryParams.append("page", pagination.page)
        queryParams.append("limit", pagination.limit)

        const res = await api.get(`/news?${queryParams.toString()}`)

        setNews(res.data.news)
        setPagination((prev) => ({
          ...prev,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages,
        }))
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [searchTerm, pagination.page, pagination.limit])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleDeleteNews = async (id) => {
    if (!window.confirm("Are you sure you want to delete this news item?")) return

    try {
      await api.delete(`/news/${id}`)
      setNews(news.filter((item) => item._id !== id))
    } catch (error) {
      console.error("Error deleting news:", error)
    }
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">News</h1>
        <Link
          to="/admin/news/add"
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center"
        >
          <FiPlus className="mr-2" /> Add News
        </Link>
      </div>

      <div className="bg-purple-800 rounded-lg p-4 mb-6">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-purple-800 rounded-lg overflow-hidden">
          <div className="animate-pulse">
            <div className="h-12 bg-purple-700/50"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 border-t border-purple-700 bg-purple-700/30"></div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-purple-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-700/50">
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Author</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {news.length > 0 ? (
                  news.map((item) => (
                    <tr key={item._id} className="border-t border-purple-700 hover:bg-purple-700/30">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-gray-300">{item.subtitle}</p>
                        </div>
                      </td>
                      <td className="p-3">{item.author}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          <span>{formatDate(item.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/news/edit/${item._id}`}
                            className="p-2 bg-blue-500 hover:bg-blue-600 rounded"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteNews(item._id)}
                            className="p-2 bg-red-500 hover:bg-red-600 rounded"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-400">
                      No news found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    pagination.page === 1 ? "text-gray-500 cursor-not-allowed" : "bg-purple-800 hover:bg-purple-700"
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>

                {[...Array(pagination.pages)].map((_, i) => {
                  // Show limited page numbers
                  if (i === 0 || i === pagination.pages - 1 || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
                    return (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-10 h-10 flex items-center justify-center rounded-full ${
                          pagination.page === i + 1 ? "bg-yellow-500 text-black" : "bg-purple-800 hover:bg-purple-700"
                        }`}
                      >
                        {i + 1}
                      </button>
                    )
                  } else if (
                    (i === 1 && pagination.page > 3) ||
                    (i === pagination.pages - 2 && pagination.page < pagination.pages - 3)
                  ) {
                    return <span key={i}>...</span>
                  }
                  return null
                })}

                <button
                  onClick={() => handlePageChange(Math.min(pagination.pages, pagination.page + 1))}
                  disabled={pagination.page === pagination.pages}
                  className={`w-10 h-10 flex items-center justify-center rounded-full ${
                    pagination.page === pagination.pages
                      ? "text-gray-500 cursor-not-allowed"
                      : "bg-purple-800 hover:bg-purple-700"
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}

export default NewsPage
