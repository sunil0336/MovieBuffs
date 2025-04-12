import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiFilter, FiChevronDown } from "react-icons/fi"
import Header from "../components/Header"
import MovieCard from "../components/MovieCard" // We'll reuse this for TV shows
// import Pagination from "../components/Pagination"
import api from "../services/api"
import TvShowCard from "../components/TvShowCard"

const TvShowsPage = () => {
  const [tvShows, setTvShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [genres, setGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })

  useEffect(() => {
    fetchGenres()
    fetchTvShows(1)
  }, [selectedGenre, sortBy])

  const fetchGenres = async () => {
    try {
      const res = await api.get("/tvshows/genres")
      setGenres(res.data.genres)
    } catch (error) {
      console.error("Error fetching genres:", error)
    }
  }

  const fetchTvShows = async (page) => {
    setLoading(true);
    try {
      let url = `/tvshows?page=${page}&sort=${sortBy}`;
      if (selectedGenre) {
        url += `&genre=${selectedGenre}`;
      }
  
      const res = await api.get(url);
  
      // ✅ Validate response structure
      const tvShowsData = res.data?.tvshows || [];
  
      setTvShows(tvShowsData);
      setPagination({
        page: res.data?.pagination?.page || 1,
        pages: res.data?.pagination?.pages || 1,
        total: res.data?.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Error fetching TV shows:", error);
      setTvShows([]); // 🛡️ Fallback
    } finally {
      setLoading(false);
    }
  };
  

  const handlePageChange = (page) => {
    fetchTvShows(page)
  }

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value)
  }

  const handleSortChange = (e) => {
    setSortBy(e.target.value)
  }

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold mb-4 md:mb-0">TV Shows</h1>

          <button
            onClick={toggleFilters}
            className="flex items-center gap-2 px-4 py-2 bg-purple-800 rounded-lg md:hidden"
          >
            <FiFilter className="w-4 h-4" />
            <span>Filters</span>
            <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>

          <div
            className={`w-full md:w-auto flex flex-col md:flex-row gap-4 mt-4 md:mt-0 ${showFilters ? "block" : "hidden md:flex"}`}
          >
            <select value={selectedGenre} onChange={handleGenreChange} className="px-4 py-2 bg-purple-800 rounded-lg">
              <option value="">All Genres</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>

            <select value={sortBy} onChange={handleSortChange} className="px-4 py-2 bg-purple-800 rounded-lg">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="rating">Highest Rated</option>
              <option value="title">Title (A-Z)</option>
              <option value="firstAirDate">Release Date</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="bg-purple-800/50 rounded-lg aspect-[2/3] animate-pulse"></div>
            ))}
          </div>
        ) : tvShows.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {tvShows.map((tvShow) => (
                <Link key={tvShow._id} to={`/tv-shows/${tvShow._id}`}>
                  {/* <MovieCard
                    title={tvShow.title}
                    poster={tvShow.poster}
                    year={new Date(tvShow.firstAirDate).getFullYear()}
                    rating={tvShow.rating}
                    type="tv"
                  /> */}
                  <TvShowCard tvshow={tvShow} />
                </Link>
              ))}
            </div>

            <div className="mt-8">
              {/* <Pagination currentPage={pagination.page} totalPages={pagination.pages} onPageChange={handlePageChange} /> */}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-4">No TV shows found</h2>
            <p className="text-gray-300 mb-6">Try changing your filters or check back later.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default TvShowsPage
