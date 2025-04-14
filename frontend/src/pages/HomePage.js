"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiChevronRight } from "react-icons/fi"
import Header from "../components/Header"
import MovieCard from "../components/MovieCard"
import NewsList from "../components/NewsList"

const HomePage = () => {
  const [topRatedMovies, setTopRatedMovies] = useState([])
  const [inTheatresMovies, setInTheatresMovies] = useState([])
  const [futurereleasesMovies, setFuturereleasesMoviesMovies] = useState([])
  const [upcomingMovies, setUpcomingMovies] = useState([])
  const [fansFavourites, setFansFavourites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [topRated, inTheatres, futurereleases, upcoming, fansFavourites] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/movies?sort=rating&limit=4`).then((res) => res.json()),
          fetch(`${process.env.REACT_APP_API_URL}/movies?category=in-theatres&limit=4`).then((res) => res.json()),
          fetch(`${process.env.REACT_APP_API_URL}/movies?category=futurereleases&limit=4`).then((res) => res.json()),
          fetch(`${process.env.REACT_APP_API_URL}/movies?category=upcoming&limit=4`).then((res) => res.json()),
          fetch(`${process.env.REACT_APP_API_URL}/movies?category=fans-favourites&limit=4`).then((res) => res.json()),
        ])

        setTopRatedMovies(topRated.movies || [])
        setInTheatresMovies(inTheatres.movies || [])
        setFuturereleasesMoviesMovies(futurereleases.movies || [])
        setUpcomingMovies(upcoming.movies || [])
        setFansFavourites(fansFavourites.movies || [])
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
        <NewsList />
        {renderMovieSection("Critics Top Rated", topRatedMovies, "top-rated")}
        {renderMovieSection("In Theatres", inTheatresMovies, "in-theatres")}
        {renderMovieSection("Future Releases", futurereleasesMovies, "futurereleases")}
        {renderMovieSection("Explore Upcoming Movies", upcomingMovies, "upcoming")}
        {renderMovieSection("Fans' Favourites", fansFavourites, "fans-favourites")}
      </main>
      <footer className="py-6 text-center text-white/60">© 2024 Crictistaan. All rights reserved. Made by Sunil ❤️</footer>
    </div>
  )
}

export default HomePage

