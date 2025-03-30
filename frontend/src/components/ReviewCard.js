"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiThumbsUp, FiThumbsDown, FiFlag, FiShare2, FiMessageSquare, FiEdit, FiTrash } from "react-icons/fi"
import { useAuth } from "../contexts/AuthContext"
import StarRating from "./StarRating"
import CommentSection from "./CommentSection"
import ShareModal from "./ShareModal"
import api from "../services/api"

const ReviewCard = ({ review, onDelete, onUpdate }) => {
  const { user } = useAuth()
  const [likes, setLikes] = useState(review.likes?.length || 0)
  const [dislikes, setDislikes] = useState(review.dislikes?.length || 0)
  const [userLiked, setUserLiked] = useState(review.likes?.includes(user?.id))
  const [userDisliked, setUserDisliked] = useState(review.dislikes?.includes(user?.id))
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState(review.comments || [])
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Update state when review prop changes
    setLikes(review.likes?.length || 0)
    setDislikes(review.dislikes?.length || 0)
    setUserLiked(review.likes?.includes(user?.id))
    setUserDisliked(review.dislikes?.includes(user?.id))
    setComments(review.comments || [])
  }, [review, user])

  const handleLike = async () => {
    if (!user) return

    try {
      const res = await api.put(`/reviews/${review._id}/like`)
      setLikes(res.data.likes)
      setDislikes(res.data.dislikes)
      setUserLiked(res.data.userLiked)
      setUserDisliked(res.data.userDisliked)
    } catch (error) {
      console.error("Error liking review:", error)
    }
  }

  const handleDislike = async () => {
    if (!user) return

    try {
      const res = await api.put(`/reviews/${review._id}/dislike`)
      setLikes(res.data.likes)
      setDislikes(res.data.dislikes)
      setUserLiked(res.data.userLiked)
      setUserDisliked(res.data.userDisliked)
    } catch (error) {
      console.error("Error disliking review:", error)
    }
  }

  const handleAddComment = async (text) => {
    try {
      const res = await api.post(`/reviews/${review._id}/comments`, { text })
      setComments(res.data.comments)
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await api.delete(`/reviews/${review._id}/comments/${commentId}`)
      setComments(res.data.comments)
    } catch (error) {
      console.error("Error deleting comment:", error)
    }
  }

  const handleDeleteReview = async () => {
    if (!window.confirm("Are you sure you want to delete this review?")) return

    setIsDeleting(true)
    try {
      await api.delete(`/reviews/${review._id}`)
      if (onDelete) onDelete(review._id)
    } catch (error) {
      console.error("Error deleting review:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const getInitials = (name) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const isOwner = user && review.userId?._id === user.id
  const isAdmin = user && user.role === "admin"

  return (
    <div className="bg-black/40 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <Link to={`/profile/${review.userId?._id}`} className="flex-shrink-0">
          <div className="h-10 w-10 bg-purple-700 rounded-full flex items-center justify-center text-white font-medium">
            {review.userId?.profileImage ? (
              <img
                src={review.userId.profileImage || "/placeholder.svg"}
                alt={review.userId.name}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              getInitials(review.userId?.name || review.author)
            )}
          </div>
        </Link>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link to={`/profile/${review.userId?._id}`} className="font-medium hover:text-yellow-400">
                {review.userId?.name || review.author}
              </Link>
              <span className="text-gray-400 text-sm">•</span>
              <span className="text-gray-400 text-sm">{formatDate(review.createdAt)}</span>
            </div>

            <div className="flex items-center gap-2">
              <StarRating initialRating={Math.floor(review.rating / 2)} readOnly maxRating={5} />
              <span className="font-bold">{review.rating}</span>
              <span className="text-gray-400">/10</span>
            </div>
          </div>

          <h3 className="text-xl font-medium mb-3">{review.title}</h3>

          <p className="text-gray-200 mb-4">{review.content}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  userLiked ? "bg-purple-800/50 text-yellow-400" : "hover:bg-purple-800/30"
                }`}
                onClick={handleLike}
                disabled={!user}
              >
                <FiThumbsUp className={`w-4 h-4 ${userLiked ? "fill-yellow-400" : ""}`} />
                <span>Like</span>
                {likes > 0 && <span className="ml-1">({likes})</span>}
              </button>

              <button
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  userDisliked ? "bg-purple-800/50 text-red-400" : "hover:bg-purple-800/30"
                }`}
                onClick={handleDislike}
                disabled={!user}
              >
                <FiThumbsDown className={`w-4 h-4 ${userDisliked ? "fill-red-400" : ""}`} />
                <span>Dislike</span>
                {dislikes > 0 && <span className="ml-1">({dislikes})</span>}
              </button>

              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm hover:bg-purple-800/30"
                onClick={() => setShowComments(!showComments)}
              >
                <FiMessageSquare className="w-4 h-4" />
                <span>Comments</span>
                {comments.length > 0 && <span className="ml-1">({comments.length})</span>}
              </button>
            </div>

            <div className="flex items-center gap-2">
              {(isOwner || isAdmin) && (
                <>
                  {onUpdate && (
                    <button
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-sm hover:bg-purple-800/30 text-yellow-400"
                      onClick={() => onUpdate(review)}
                    >
                      <FiEdit className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  )}

                  <button
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-sm hover:bg-purple-800/30 text-red-400"
                    onClick={handleDeleteReview}
                    disabled={isDeleting}
                  >
                    <FiTrash className="w-4 h-4" />
                    <span className="hidden sm:inline">{isDeleting ? "Deleting..." : "Delete"}</span>
                  </button>
                </>
              )}

              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm hover:bg-purple-800/30"
                onClick={() => setIsShareModalOpen(true)}
              >
                <FiShare2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {user && (
                <button className="flex items-center gap-1 px-3 py-1 rounded-full text-sm hover:bg-purple-800/30">
                  <FiFlag className="w-4 h-4" />
                  <span className="hidden sm:inline">Report</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="mt-6 border-t border-purple-800 pt-4">
          <CommentSection
            comments={comments}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            currentUserId={user?.id}
            isAdmin={isAdmin}
          />
        </div>
      )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        type="review"
        id={review._id}
        title={review.movieId?.title || "this movie"}
      />
    </div>
  )
}

export default ReviewCard

