"use client"

import { useState } from "react"
import { FiThumbsUp, FiThumbsDown, FiFlag } from "react-icons/fi"
import StarRating from "./StarRating"

const ReviewCard = ({ review }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0)
  const [notHelpfulCount, setNotHelpfulCount] = useState(review.notHelpfulCount || 0)
  const [userVote, setUserVote] = useState(null)

  const handleVote = async (voteType) => {
    if (userVote === voteType) {
      // User is removing their vote
      if (voteType === "helpful") {
        setHelpfulCount(helpfulCount - 1)
      } else {
        setNotHelpfulCount(notHelpfulCount - 1)
      }
      setUserVote(null)
    } else {
      // User is changing their vote or voting for the first time
      if (userVote === "helpful" && voteType === "not-helpful") {
        setHelpfulCount(helpfulCount - 1)
        setNotHelpfulCount(notHelpfulCount + 1)
      } else if (userVote === "not-helpful" && voteType === "helpful") {
        setHelpfulCount(helpfulCount + 1)
        setNotHelpfulCount(notHelpfulCount - 1)
      } else if (voteType === "helpful") {
        setHelpfulCount(helpfulCount + 1)
      } else {
        setNotHelpfulCount(notHelpfulCount + 1)
      }
      setUserVote(voteType)
    }

    // In a real app, you'd send this to the server
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/reviews/${review._id}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voteType }),
        credentials: "include",
      })
    } catch (error) {
      console.error("Error voting on review:", error)
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

  return (
    <div className="bg-black/40 rounded-lg p-6">
      <div className="flex items-start gap-4">
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

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{review.userId?.name || review.author}</span>
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
                  userVote === "helpful" ? "bg-purple-800/50" : "hover:bg-purple-800/30"
                }`}
                onClick={() => handleVote("helpful")}
              >
                <FiThumbsUp className="w-4 h-4" />
                <span>Helpful</span>
                {helpfulCount > 0 && <span className="ml-1">({helpfulCount})</span>}
              </button>

              <button
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                  userVote === "not-helpful" ? "bg-purple-800/50" : "hover:bg-purple-800/30"
                }`}
                onClick={() => handleVote("not-helpful")}
              >
                <FiThumbsDown className="w-4 h-4" />
                <span>Not helpful</span>
                {notHelpfulCount > 0 && <span className="ml-1">({notHelpfulCount})</span>}
              </button>
            </div>

            <button className="flex items-center gap-1 px-3 py-1 rounded-full text-sm hover:bg-purple-800/30">
              <FiFlag className="w-4 h-4" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewCard

