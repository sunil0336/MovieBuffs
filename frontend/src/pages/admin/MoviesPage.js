"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiFilter, FiX,FiStar ,FiChevronLeft, FiChevronRight } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"

const MoviesPage = () => {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    genre: "",
    language: "",
    year: "",
    category: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    languages: [],
    years: [],
    categories: ["top-rated", "in-theatres", "coming-soon", "upcoming"],
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await api.get("/movies/filters")
        setFilterOptions((prev) => ({
          ...prev,
          ...res.data.filters,
        }))
      } catch (error) {
        console.error("Error fetching filter options:", error)
      }
    }

    fetchFilterOptions()
  }, [])

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()

        if (searchTerm) queryParams.append("search", searchTerm)
        if (filters.genre) queryParams.append("genre", filters.genre)
        if (filters.language) queryParams.append("language", filters.language)
        if (filters.year) queryParams.append("year", filters.year)
        if (filters.category) queryParams.append("category", filters.category)

        queryParams.append("page", pagination.page)
        queryParams.append("limit", pagination.limit)

        const res = await api.get(`/movies?${queryParams.toString()}`)

        setMovies(res.data.movies)
        setPagination((prev) => ({
          ...prev,
          total: res.data.pagination.total,
          pages: res.data.pagination.pages,
        }))
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [searchTerm, filters, pagination.page, pagination.limit])

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, page: 1 }))
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      genre: "",
      language: "",
      year: "",
      category: "",
    })
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handleDeleteMovie = async (id) => {
    if (!window.confirm("Are you sure you want to delete this movie?")) return

    try {
      await api.delete(`/movies/${id}`)
      setMovies(movies.filter((movie) => movie._id !== id))
    } catch (error) {
      console.error("Error deleting movie:", error)
    }
  }

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movies</h1>
        <Link
          to="/admin/movies/add"
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center"
        >
          <FiPlus className="mr-2" /> Add Movie
        </Link>
      </div>

      <div className="bg-purple-800 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search movies..."
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

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-purple-700 text-white hover:bg-purple-700 rounded flex items-center"
          >
            <FiFilter className="mr-2" /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Genre</label>
              <select
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
                className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
              >
                <option value="">All Genres</option>
                {filterOptions.genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
                className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
              >
                <option value="">All Languages</option>
                {filterOptions.languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <select
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
              >
                <option value="">All Years</option>
                {filterOptions.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((category) => (
                  <option key={category} value={category}>
                    {category
                      .split("-")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end gap-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-purple-700 text-white hover:bg-purple-700 rounded"
              >
                Clear
              </button>
              <button onClick={applyFilters} className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active filters display */}
      {(filters.genre || filters.language || filters.year || filters.category) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {filters.genre && (
            <div className="bg-purple-800 rounded-full px-3 py-1 text-sm flex items-center">
              Genre: {filters.genre}
              <button className="ml-2" onClick={() => setFilters((prev) => ({ ...prev, genre: "" }))}>
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.language && (
            <div className="bg-purple-800 rounded-full px-3 py-1 text-sm flex items-center">
              Language: {filters.language}
              <button className="ml-2" onClick={() => setFilters((prev) => ({ ...prev, language: "" }))}>
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.year && (
            <div className="bg-purple-800 rounded-full px-3 py-1 text-sm flex items-center">
              Year: {filters.year}
              <button className="ml-2" onClick={() => setFilters((prev) => ({ ...prev, year: "" }))}>
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}

          {filters.category && (
            <div className="bg-purple-800 rounded-full px-3 py-1 text-sm flex items-center">
              Category:{" "}
              {filters.category
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
              <button className="ml-2" onClick={() => setFilters((prev) => ({ ...prev, category: "" }))}>
                <FiX className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}

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
                  <th className="p-3 text-left">Movie</th>
                  <th className="p-3 text-left">Year</th>
                  <th className="p-3 text-left">Language</th>
                  <th className="p-3 text-left">Rating</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.length > 0 ? (
                  movies.map((movie) => (
                    <tr key={movie._id} className="border-t border-purple-700 hover:bg-purple-700/30">
                      <td className="p-3">
                        <div className="flex items-center">
                          <div className="w-10 h-15 bg-purple-700 rounded mr-3 overflow-hidden">
                            {movie.poster && (
                              <img
                                src={movie.poster || "/placeholder.svg"}
                                alt={movie.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <span className="font-medium">{movie.title}</span>
                        </div>
                      </td>
                      <td className="p-3">{movie.year}</td>
                      <td className="p-3">{movie.language}</td>
                      <td className="p-3">
                        <div className="flex items-center">
                          <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                          <span>{movie.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        {movie.category
                          ? movie.category
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")
                          : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/movies/edit/${movie._id}`}
                            className="p-2 bg-blue-500 hover:bg-blue-600 rounded"
                            title="Edit"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteMovie(movie._id)}
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
                    <td colSpan="6" className="p-4 text-center text-gray-400">
                      No movies found
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

export default MoviesPage

