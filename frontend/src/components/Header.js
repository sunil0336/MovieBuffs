"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { FiMenu, FiX } from "react-icons/fi"
import { useAuth } from "../contexts/AuthContext"
import UserMenu from "./UserMenu"
import SearchBar from "./SearchBar"

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const location = useLocation()
  const { user } = useAuth()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSearch = async (term) => {
    if (!term) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/movies/search?q=${encodeURIComponent(term)}`)
      const data = await response.json()
      setSearchResults(data.movies)
    } catch (error) {
      console.error("Search error:", error)
    }
  }

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "TV Shows", path: "/tv-shows" },
    { name: "Top Reviews", path: "/top-reviews" },
  ]

  return (
    <header className="bg-purple-900 py-3 px-4 sticky top-0 z-10 border-b border-purple-800">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-xl font-bold text-white">
              Crictistaan
            </Link>

            <nav className="hidden md:flex">
              <ul className="flex gap-6">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`text-white hover:text-yellow-400 ${
                        location.pathname === item.path ? "text-yellow-400 font-medium" : ""
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block w-[300px] relative">
              <SearchBar onSearch={handleSearch} />

              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-purple-950 rounded-md shadow-lg z-20 max-h-[400px] overflow-y-auto">
                  <ul className="py-2">
                    {searchResults.map((movie) => (
                      <li key={movie._id}>
                        <Link
                          to={`/movies/${movie._id}`}
                          className="flex items-center px-4 py-2 hover:bg-purple-800"
                          onClick={() => setSearchResults([])}
                        >
                          <div className="w-8 h-12 bg-purple-800 rounded mr-2 flex-shrink-0">
                            {movie.poster && (
                              <img
                                src={movie.poster || "/placeholder.svg"}
                                alt={movie.title}
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{movie.title}</p>
                            <p className="text-xs text-gray-300">{movie.year}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <UserMenu />

            <button className="md:hidden text-white" onClick={toggleMenu}>
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="mb-4">
              <SearchBar onSearch={handleSearch} />

              {searchResults.length > 0 && (
                <div className="mt-1 bg-purple-950 rounded-md shadow-lg">
                  <ul className="py-2">
                    {searchResults.map((movie) => (
                      <li key={movie._id}>
                        <Link
                          to={`/movies/${movie._id}`}
                          className="flex items-center px-4 py-2 hover:bg-purple-800"
                          onClick={() => {
                            setSearchResults([])
                            setIsMenuOpen(false)
                          }}
                        >
                          <div className="w-8 h-12 bg-purple-800 rounded mr-2 flex-shrink-0">
                            {movie.poster && (
                              <img
                                src={movie.poster || "/placeholder.svg"}
                                alt={movie.title}
                                className="w-full h-full object-cover rounded"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{movie.title}</p>
                            <p className="text-xs text-gray-300">{movie.year}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <nav>
              <ul className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`block py-2 px-3 rounded-md text-white hover:bg-purple-800 ${
                        location.pathname === item.path ? "bg-purple-800 text-yellow-400" : ""
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header

