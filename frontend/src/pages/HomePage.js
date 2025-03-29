"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiChevronRight } from "react-icons/fi"
import Header from "../components/Header"
import MovieCard from "../components/MovieCard"

const HomePage = () => {
  const [topRatedMovies, setTopRatedMovies] = useState([])
  const [inTheatresMovies, setInTheatresMovies] = useState([])
  const [comingSoonMovies, setComingSoonMovies] = useState([])
  const [upcomingMovies, setUpcomingMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [topRated, inTheatres, comingSoon, upcoming] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/movies?category=top-rated&limit=4`).then((res) => res.json()),
          fetch(`${process.env.REACT_APP_API_URL}/movies?category=in-theatres&limit=4`).then((res) => res.json()),
          fetch(`${process.env.REACT_APP_API_URL}/movies?category=coming-soon&limit=4`).then((res) => res.json()),
          fetch(`${process.env.REACT_APP_API_URL}/movies?category=upcoming&limit=4`).then((res) => res.json()),
        ])

        setTopRatedMovies(topRated.movies || [])
        setInTheatresMovies(inTheatres.movies || [])
        setComingSoonMovies(comingSoon.movies || [])
        setUpcomingMovies(upcoming.movies || [])
      } catch (error) {
        console.error("Error fetching movies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const renderMovieSection = (title, movies, category) => (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium flex items-center gap-2">
          <span className="w-1 h-5 bg-yellow-500 rounded-full"></span>
          {title}
        </h2>

        <Link
          to={`/movies?category=${category}`}
          className="flex items-center text-sm text-purple-200 hover:text-yellow-400"
        >
          <span>See all</span>
          <FiChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
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
        <div className="text-center py-8 text-gray-400">No movies found</div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Placeholder */}
        <div className="relative mt-6 mb-12 rounded-xl overflow-hidden">
          <div className="aspect-[21/9] relative bg-purple-800">
            <img
              src="/placeholder.svg?height=600&width=1400"
              alt="Featured movie"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 max-w-lg">
              <h1 className="text-3xl font-bold mb-2">Interstellar Re-Release</h1>
              <h2 className="text-xl font-medium mb-2">Tickets now Available for IMAX Screens All Across India!!</h2>
              <p className="text-purple-200 mb-4">Interstellar Re-releases in India on February 7</p>
            </div>
          </div>
        </div>

        {renderMovieSection("Critics Top Rated", topRatedMovies, "top-rated")}
        {renderMovieSection("Movies in Theatres", inTheatresMovies, "in-theatres")}
        {renderMovieSection("Coming Soon to Theaters", comingSoonMovies, "coming-soon")}
        {renderMovieSection("Explore Upcoming Movies", upcomingMovies, "upcoming")}
      </main>
      <footer className="py-6 text-center text-white/60">© 2024 Crictistaan. All rights reserved.</footer>
    </div>
  )
}

export default HomePage

