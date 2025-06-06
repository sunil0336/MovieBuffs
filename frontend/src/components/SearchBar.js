"use client"

import { useState, useEffect, useRef } from "react"
import { FiSearch, FiX } from "react-icons/fi"

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const searchTimeout = useRef(null)
  const lastSearchTerm = useRef("")

  useEffect(() => {
    // Clear any existing timer
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current)
    }

    // Set new debounce timer
    searchTimeout.current = setTimeout(() => {
      const trimmed = searchTerm.trim()
      if (
        onSearch &&
        trimmed !== "" &&
        trimmed !== lastSearchTerm.current // Avoid duplicate calls
      ) {
        onSearch(trimmed)
        lastSearchTerm.current = trimmed
      }
    }, 500)

    return () => {
      clearTimeout(searchTimeout.current)
    }
  }, [searchTerm, onSearch])

  const handleSearch = (e) => {
    e.preventDefault()
    const trimmed = searchTerm.trim()
    if (onSearch && trimmed !== "") {
      onSearch(trimmed)
      lastSearchTerm.current = trimmed
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    lastSearchTerm.current = ""
    if (onSearch) {
      onSearch("")
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <input
        type="search"
        placeholder="Search for movies, TV shows, actors..."
        className="bg-purple-800 text-white rounded-full py-1 pl-9 pr-10 w-full focus:outline-none focus:ring-1 focus:ring-yellow-400 placeholder:text-purple-300"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-4 h-4" />

      {searchTerm && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-10 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}

      <button
        type="submit"
        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 rounded-full bg-yellow-500 text-black hover:bg-yellow-600 flex items-center justify-center"
      >
        <FiSearch className="w-4 h-4" />
        <span className="sr-only">Search</span>
      </button>
    </form>
  )
}

export default SearchBar
