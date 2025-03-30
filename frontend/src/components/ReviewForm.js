"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import StarRating from "./StarRating"

const ReviewForm = ({ movieId, movieTitle, onReviewAdded }) => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [containsSpoilers, setContainsSpoilers] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user) {
      setError("You must be logged in to submit a review")
      return
    }

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieId,
          rating,
          title,
          content,
          containsSpoilers,
        }),
        credentials: "include",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review")
      }

      setSubmitted(true)

      if (onReviewAdded) {
        onReviewAdded(data.review)
      }
    } catch (error) {
      console.error("Error submitting review:", error)
      setError(error.message || "Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setRating(0)
    setTitle("")
    setContent("")
    setContainsSpoilers(false)
    setSubmitted(false)
    setError("")
  }

  if (!user) {
    return (
      <div className="bg-purple-800/50 rounded-lg p-8 text-center">
        <h3 className="text-xl font-medium mb-4">Sign in to review</h3>
        <p className="text-gray-300 mb-6">You need to be logged in to submit a review.</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="px-4 py-2 border border-white text-white hover:bg-purple-800 rounded"
          >
            Create Account
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="bg-purple-800/50 rounded-lg p-8 text-center">
        <h3 className="text-xl font-medium mb-4">Thank you for your review!</h3>
        <p className="text-gray-300 mb-6">Your review has been submitted and will be visible after moderation.</p>
        <button onClick={resetForm} className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded">
          Write another review
        </button>
      </div>
    )
  }

  return (
    <div className="bg-purple-800/50 rounded-lg p-6">
      <h3 className="text-xl font-medium mb-6">Review "{movieTitle}"</h3>

      {error && <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 text-white">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Your Rating</label>
          <StarRating initialRating={rating} onRatingChange={setRating} maxRating={5} />
        </div>

        <div>
          <label htmlFor="review-title" className="block text-sm font-medium mb-2">
            Review Title
          </label>
          <input
            id="review-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your thoughts"
            className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white placeholder:text-gray-400"
            required
          />
        </div>

        <div>
          <label htmlFor="review-content" className="block text-sm font-medium mb-2">
            Your Review
          </label>
          <textarea
            id="review-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your review here..."
            className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white placeholder:text-gray-400 min-h-[150px]"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="contains-spoilers"
            checked={containsSpoilers}
            onChange={(e) => setContainsSpoilers(e.target.checked)}
            className="rounded bg-transparent border-gray-600"
          />
          <label htmlFor="contains-spoilers" className="text-sm">
            This review contains spoilers
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-black rounded"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ReviewForm

