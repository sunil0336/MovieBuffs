"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiSave, FiX, FiArrowLeft } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"

const MovieFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [filterOptions, setFilterOptions] = useState({
    genres: [],
    languages: [],
    categories: ["top-rated", "in-theatres", "coming-soon", "upcoming"],
  })

  const [formData, setFormData] = useState({
    title: "",
    year: new Date().getFullYear(),
    genres: [],
    language: "",
    director: "",
    cast: [""],
    plot: "",
    poster: "",
    backdrop: "",
    rating: 0,
    runtime: 0,
    releaseDate: new Date().toISOString().split("T")[0],
    category: "upcoming",
  })

  // Fetch filter options
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

  // Fetch movie data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchMovie = async () => {
        try {
          const res = await api.get(`/movies/${id}`)
          const movie = res.data.movie

          // Format the date for the input field
          const releaseDate = new Date(movie.releaseDate).toISOString().split("T")[0]

          setFormData({
            ...movie,
            releaseDate,
          })
          setLoading(false)
        } catch (error) {
          console.error("Error fetching movie:", error)
          setError("Failed to load movie data")
          setLoading(false)
        }
      }

      fetchMovie()
    }
  }, [id, isEditMode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }))
  }

  const handleGenreChange = (e) => {
    const { value, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      genres: checked ? [...prev.genres, value] : prev.genres.filter((genre) => genre !== value),
    }))
  }

  const handleCastChange = (index, value) => {
    const newCast = [...formData.cast]
    newCast[index] = value
    setFormData((prev) => ({
      ...prev,
      cast: newCast,
    }))
  }

  const addCastMember = () => {
    setFormData((prev) => ({
      ...prev,
      cast: [...prev.cast, ""],
    }))
  }

  const removeCastMember = (index) => {
    if (formData.cast.length > 1) {
      const newCast = [...formData.cast]
      newCast.splice(index, 1)
      setFormData((prev) => ({
        ...prev,
        cast: newCast,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      // Filter out empty cast members
      const submissionData = {
        ...formData,
        cast: formData.cast.filter((member) => member.trim() !== ""),
      }

      if (isEditMode) {
        await api.put(`/movies/${id}`, submissionData)
      } else {
        await api.post("/movies", submissionData)
      }

      navigate("/admin/movies")
    } catch (error) {
      console.error("Error saving movie:", error)
      setError(error.response?.data?.error || "Failed to save movie")
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit Movie" : "Add Movie"}</h1>
        <button
          onClick={() => navigate("/admin/movies")}
          className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Movies
        </button>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-purple-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium mb-1">Year *</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleNumberChange}
              required
              min="1900"
              max="2100"
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium mb-1">Language *</label>
            <select
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            >
              <option value="">Select Language</option>
              {filterOptions.languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          {/* Director */}
          <div>
            <label className="block text-sm font-medium mb-1">Director *</label>
            <input
              type="text"
              name="director"
              value={formData.director}
              onChange={handleChange}
              required
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Runtime */}
          <div>
            <label className="block text-sm font-medium mb-1">Runtime (minutes) *</label>
            <input
              type="number"
              name="runtime"
              value={formData.runtime}
              onChange={handleNumberChange}
              required
              min="1"
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-1">Rating (0-10)</label>
            <input
              type="number"
              name="rating"
              value={formData.rating}
              onChange={handleNumberChange}
              min="0"
              max="10"
              step="0.1"
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Release Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Release Date *</label>
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              required
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            >
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

          {/* Poster URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Poster URL</label>
            <input
              type="text"
              name="poster"
              value={formData.poster}
              onChange={handleChange}
              placeholder="/images/poster.jpg"
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Backdrop URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Backdrop URL</label>
            <input
              type="text"
              name="backdrop"
              value={formData.backdrop}
              onChange={handleChange}
              placeholder="/images/backdrop.jpg"
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Genres */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Genres *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {filterOptions.genres.map((genre) => (
                <div key={genre} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`genre-${genre}`}
                    value={genre}
                    checked={formData.genres.includes(genre)}
                    onChange={handleGenreChange}
                    className="mr-2"
                  />
                  <label htmlFor={`genre-${genre}`}>{genre}</label>
                </div>
              ))}
            </div>
            {formData.genres.length === 0 && (
              <p className="text-red-400 text-sm mt-1">Please select at least one genre</p>
            )}
          </div>

          {/* Cast */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Cast *</label>
            {formData.cast.map((member, index) => (
              <div key={index} className="flex items-center mb-2">
                <input
                  type="text"
                  value={member}
                  onChange={(e) => handleCastChange(index, e.target.value)}
                  placeholder="Actor name"
                  className="flex-1 p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
                />
                <button
                  type="button"
                  onClick={() => removeCastMember(index)}
                  className="ml-2 p-2 bg-red-500 hover:bg-red-600 rounded"
                  disabled={formData.cast.length <= 1}
                >
                  <FiX />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCastMember}
              className="mt-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded"
            >
              Add Cast Member
            </button>
          </div>

          {/* Plot */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Plot *</label>
            <textarea
              name="plot"
              value={formData.plot}
              onChange={handleChange}
              required
              rows="4"
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            ></textarea>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 border-t border-purple-700 pt-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Poster</h3>
              <div className="bg-purple-900/50 border border-purple-700 rounded-lg overflow-hidden h-64 flex items-center justify-center">
                {formData.poster ? (
                  <img
                    src={formData.poster || "/placeholder.svg"}
                    alt="Poster preview"
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg"
                    }}
                  />
                ) : (
                  <span className="text-purple-500">No poster image</span>
                )}
              </div>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-2">Movie Details</h3>
              <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-4">
                <h4 className="text-xl font-bold">{formData.title || "Movie Title"}</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm bg-purple-700 px-2 py-1 rounded">{formData.year}</span>
                  <span className="text-sm bg-purple-700 px-2 py-1 rounded">{formData.runtime} min</span>
                  <span className="text-sm bg-purple-700 px-2 py-1 rounded">{formData.language}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.genres.map((genre) => (
                    <span key={genre} className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded">
                      {genre}
                    </span>
                  ))}
                </div>
                <p className="mt-3 text-sm text-gray-300">
                  <strong>Director:</strong> {formData.director || "Director name"}
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  <strong>Cast:</strong> {formData.cast.filter((c) => c.trim()).join(", ") || "Cast members"}
                </p>
                <p className="mt-3 text-sm line-clamp-3">{formData.plot || "Movie plot description..."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/movies")}
            className="px-4 py-2 border border-purple-700 text-white hover:bg-purple-700 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || formData.genres.length === 0}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {saving ? "Saving..." : "Save Movie"}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

export default MovieFormPage
