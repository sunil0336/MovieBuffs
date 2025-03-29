"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { FiFilter, FiChevronDown, FiX } from "react-icons/fi"
import Header from "../components/Header"
import MovieCard from "../components/MovieCard"

const MoviesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    genre: searchParams.get("genre") || "",
    language: searchParams.get("language") || "",
    year: searchParams.get("year") || "",
    category: searchParams.get("category") || "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    languages: [],
    years: [],
  })
  const [pagination, setPagination] = useState({
    page: Number.parseInt(searchParams.get("page") || "1"),
    limit: 12,
    total: 0,
    pages: 0,
  })

  // Fetch filter options
  useEffect(() => {
    async function fetchFilterOptions() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/movies/filters`)
        const data = await res.json()
        setFilterOptions(data.filters || { genres: [], languages: [], years: [] })
      } catch (error) {
        console.error("Error fetching filter options:", error)
      }
    }

    fetchFilterOptions()
  }, [])

  // Fetch movies based on filters
  useEffect(() => {
    async function fetchMovies() {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams()

        if (filters.genre) queryParams.append("genre", filters.genre)
        if (filters.language) queryParams.append("language", filters.language)
        if (filters.year) queryParams.append("year", filters.year)
        if (filters.category) queryParams.append("category", filters.category)
        queryParams.append("page", pagination.page.toString())
        queryParams.append("limit", pagination.limit.toString())

        const res = await fetch(`${process.env.REACT_APP_API_URL}/movies?${queryParams.toString()}`)
        const data = await res.json()

        setMovies(data.movies || [])
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          pages: data.pagination?.pages || 0,
        }))
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [filters, pagination.page, pagination.limit])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    const queryParams = new URLSearchParams()

    if (filters.genre) queryParams.append("genre", filters.genre)
    if (filters.language) queryParams.append("language", filters.language)
    if (filters.year) queryParams.append("year", filters.year)
    if (filters.category) queryParams.append("category", filters.category)
    queryParams.append("page", "1") // Reset to first page when applying filters

    setSearchParams(queryParams)
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      genre: "",
      language: "",
      year: "",
      category: "",
    })
    setSearchParams({})
    setPagination((prev) => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (page) => {
    const queryParams = new URLSearchParams(searchParams.toString())
    queryParams.set("page", page.toString())
    setSearchParams(queryParams)
    setPagination((prev) => ({ ...prev, page }))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Movies</h1>

          <button
            className="px-4 py-2 border border-purple-700 text-white hover:bg-purple-800 rounded flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter className="w-4 h-4" />
            Filters
            <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="bg-purple-800/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select
                  name="genre"
                  value={filters.genre}
                  onChange={handleFilterChange}
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
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
                <label className="block text-sm font-medium mb-2">Language</label>
                <select
                  name="language"
                  value={filters.language}
                  onChange={handleFilterChange}
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
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
                <label className="block text-sm font-medium mb-2">Release Year</label>
                <select
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
                >
                  <option value="">All Years</option>
                  {filterOptions.years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end mt-4 gap-2">
              <button
                className="px-4 py-2 border border-purple-700 text-white hover:bg-purple-800 rounded flex items-center gap-2"
                onClick={clearFilters}
              >
                <FiX className="w-4 h-4" />
                Clear
              </button>

              <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded" onClick={applyFilters}>
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Active filters display */}
        {(filters.genre || filters.language || filters.year || filters.category) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.genre && (
              <div className="bg-purple-800 rounded-full px-3 py-1 text-sm flex items-center">
                Genre: {filters.genre}
                <button
                  className="ml-2"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, genre: "" }))
                  }}
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.language && (
              <div className="bg-purple-800 rounded-full px-3 py-1 text-sm flex items-center">
                Language: {filters.language}
                <button
                  className="ml-2"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, language: "" }))
                  }}
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.year && (
              <div className="bg-purple-800 rounded-full px-3 py-1 text-sm flex items-center">
                Year: {filters.year}
                <button
                  className="ml-2"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, year: "" }))
                  }}
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}

            {filters.category && (
              <div className="bg-purple-800 rounded-full px-3 py-1 text-sm flex items-center">
                Category: {filters.category.replace("-", " ")}
                <button
                  className="ml-2"
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, category: "" }))
                  }}
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-purple-800/50 rounded-xl mb-2"></div>
                <div className="h-4 bg-purple-800/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-purple-800/50 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : movies.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} variant="poster" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No movies found matching your filters</p>
            <button
              className="mt-4 px-4 py-2 border border-purple-700 text-white hover:bg-purple-800 rounded"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        )}

        {pagination.pages > 1 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  pagination.page === 1 ? "text-gray-500 cursor-not-allowed" : "text-white hover:bg-purple-800"
                }`}
                disabled={pagination.page === 1}
                onClick={() => handlePageChange(pagination.page - 1)}
              >
                <FiChevronDown className="w-5 h-5 rotate-90" />
              </button>

              {[...Array(pagination.pages)].map((_, i) => {
                // Show limited page numbers
                if (i === 0 || i === pagination.pages - 1 || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
                  return (
                    <button
                      key={i + 1}
                      className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        i + 1 === pagination.page
                          ? "bg-purple-700 hover:bg-purple-600"
                          : "text-white hover:bg-purple-800"
                      }`}
                      onClick={() => handlePageChange(i + 1)}
                    >
                      {i + 1}
                    </button>
                  )
                } else if (
                  (i === 1 && pagination.page > 3) ||
                  (i === pagination.pages - 2 && pagination.page < pagination.pages - 3)
                ) {
                  return <span key={i}>...</span>
                } else {
                  return null
                }
              })}

              <button
                className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  pagination.page === pagination.pages
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-white hover:bg-purple-800"
                }`}
                disabled={pagination.page === pagination.pages}
                onClick={() => handlePageChange(pagination.page + 1)}
              >
                <FiChevronDown className="w-5 h-5 -rotate-90" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default MoviesPage

