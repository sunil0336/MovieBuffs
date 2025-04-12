"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { FiSave, FiArrowLeft } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"

const NewsFormPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)
  const [loading, setLoading] = useState(isEditMode)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    author: "",
    image: "",
    createdAt: new Date().toISOString().split("T")[0],
  })

  // Fetch news data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchNews = async () => {
        try {
          const res = await api.get(`/news/${id}`)
          const news = res.data.news

          // Format the date for the input field
          const createdAt = new Date(news.createdAt).toISOString().split("T")[0]

          setFormData({
            ...news,
            createdAt,
          })
          setLoading(false)
        } catch (error) {
          console.error("Error fetching news:", error)
          setError("Failed to load news data")
          setLoading(false)
        }
      }

      fetchNews()
    }
  }, [id, isEditMode])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (isEditMode) {
        await api.put(`/news/${id}`, formData)
      } else {
        await api.post("/news", formData)
      }

      navigate("/admin/news")
    } catch (error) {
      console.error("Error saving news:", error)
      setError(error.response?.data?.error || "Failed to save news")
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
        <h1 className="text-2xl font-bold">{isEditMode ? "Edit News" : "Add News"}</h1>
        <button
          onClick={() => navigate("/admin/news")}
          className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white rounded flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to News
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
          <div className="md:col-span-2">
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

          {/* Subtitle */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Subtitle *</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              required
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium mb-1">Author *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              required
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-1">Date *</label>
            <input
              type="date"
              name="createdAt"
              value={formData.createdAt}
              onChange={handleChange}
              required
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Image URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="/images/news.jpg"
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
              className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            ></textarea>
          </div>
        </div>

        {/* Preview */}
        <div className="mt-8 border-t border-purple-700 pt-6">
          <h2 className="text-xl font-bold mb-4">Preview</h2>
          <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {formData.image && (
                <div className="md:w-1/3">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="News preview"
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg"
                    }}
                  />
                </div>
              )}
              <div className={formData.image ? "md:w-2/3" : "w-full"}>
                <h3 className="text-xl font-bold">{formData.title || "News Title"}</h3>
                <p className="text-lg text-gray-300 mt-1">{formData.subtitle || "News Subtitle"}</p>
                <div className="flex items-center mt-2 text-sm text-gray-400">
                  <span>{formData.author || "Author"}</span>
                  <span className="mx-2">•</span>
                  <span>{new Date(formData.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="mt-4 text-sm line-clamp-4">{formData.description || "News description..."}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => navigate("/admin/news")}
            className="px-4 py-2 border border-purple-700 text-white hover:bg-purple-700 rounded mr-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {saving ? "Saving..." : "Save News"}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

export default NewsFormPage
