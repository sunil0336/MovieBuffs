"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FiSend, FiTrash } from "react-icons/fi"
import { useAuth } from "../contexts/AuthContext"

const CommentSection = ({ comments, onAddComment, onDeleteComment, currentUserId, isAdmin }) => {
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !user) return

    setIsSubmitting(true)
    try {
      await onAddComment(newComment)
      setNewComment("")
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
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

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Comments ({comments.length})</h4>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center"
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              "Posting..."
            ) : (
              <>
                <FiSend className="mr-1" /> Post
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="bg-purple-800/30 p-3 rounded text-center">
          <Link to="/login" className="text-yellow-400 hover:underline">
            Sign in
          </Link>{" "}
          to post a comment
        </div>
      )}

      <div className="space-y-4 mt-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 bg-purple-800/20 p-3 rounded">
              <Link to={`/profile/${comment.user._id}`} className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-700 rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {comment.user.profileImage ? (
                    <img
                      src={comment.user.profileImage || "/placeholder.svg"}
                      alt={comment.user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(comment.user.name || comment.user.username)
                  )}
                </div>
              </Link>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <Link to={`/profile/${comment.user._id}`} className="font-medium text-sm hover:text-yellow-400">
                      {comment.user.name || comment.user.username}
                    </Link>
                    <span className="text-xs text-gray-400 ml-2">{formatDate(comment.createdAt)}</span>
                  </div>

                  {(currentUserId === comment.user._id || isAdmin) && (
                    <button
                      onClick={() => onDeleteComment(comment._id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete comment"
                    >
                      <FiTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <p className="text-sm mt-1">{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  )
}

export default CommentSection

