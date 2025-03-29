"use client"

import { useState } from "react"
import { FiStar } from "react-icons/fi"

const StarRating = ({ initialRating = 0, readOnly = false, onRatingChange, maxRating = 5 }) => {
  const [rating, setRating] = useState(initialRating)
  const [hoverRating, setHoverRating] = useState(0)

  const handleRatingChange = (newRating) => {
    if (readOnly) return

    setRating(newRating)
    if (onRatingChange) {
      onRatingChange(newRating)
    }
  }

  return (
    <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1
        return (
          <button
            key={starValue}
            type="button"
            className={`p-0.5 focus:outline-none ${readOnly ? "cursor-default" : "cursor-pointer"}`}
            onClick={() => handleRatingChange(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
          >
            <FiStar
              className={`w-5 h-5 transition-colors ${
                (hoverRating ? hoverRating >= starValue : rating >= starValue)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-400"
              }`}
            />
          </button>
        )
      })}
      {rating > 0 && !readOnly && (
        <span className="ml-2 text-sm font-medium">
          {rating}/{maxRating}
        </span>
      )}
    </div>
  )
}

export default StarRating

