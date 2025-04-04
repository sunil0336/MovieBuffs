"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiEdit2, FiStar } from "react-icons/fi"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"

const ProfilePage = () => {
  const { user } = useAuth()
  const [userReviews, setUserReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserReviews = async () => {
      if (!user) return

      setLoading(true)
      try {
        // In a real app, you'd have an endpoint to get user reviews
        // This is a placeholder implementation
        const res = await fetch(`${process.env.REACT_APP_API_URL}/reviews?userId=${user.id}`)
        const data = await res.json()
        setUserReviews(data.reviews || [])
      } catch (error) {
        console.error("Error fetching user reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserReviews()
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-purple-900 text-white">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Link to="/login" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="max-w-3xl mx-auto bg-purple-950 rounded-3xl p-8 mb-12">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative w-32 h-32 bg-purple-800 rounded-full flex items-center justify-center text-4xl font-bold">
              {user.profileImage ? (
                <img
                  src={user.profileImage || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user.name.charAt(0)
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="space-y-2 mb-6">
                <p className="text-lg font-medium">Name: {user.name}</p>
                <p className="text-gray-300">Email: {user.email}</p>
                <p className="text-gray-300">Username: {user.username}</p>
              </div>

              <button className="px-4 py-2 border border-white text-white hover:bg-purple-800 rounded flex items-center gap-2">
                <Link to="/profile/edit" className="flex items-center gap-2">
                  <FiEdit2 className="w-4 h-4" />
                  Edit profile
                </Link>
              </button>
            </div>
          </div>
        </div>

        {/* User Reviews Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Your Reviews</h2>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-purple-800/50 rounded-lg p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-24 bg-purple-700 rounded"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-purple-700 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-purple-700 rounded w-1/4 mb-4"></div>
                      <div className="h-3 bg-purple-700 rounded w-full mb-2"></div>
                      <div className="h-3 bg-purple-700 rounded w-full mb-2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : userReviews.length > 0 ? (
            <div className="space-y-6">
              {userReviews.map((review) => (
                <div key={review._id} className="bg-purple-800/50 rounded-lg p-6">
                  <div className="flex gap-4">
                    <Link to={`/movies/${review.movieId._id}`} className="flex-shrink-0">
                      <div className="w-16 h-24 bg-purple-800 rounded overflow-hidden">
                        {review.movieId?.poster && (
                          <img
                            src={review.movieId.poster || "/placeholder.svg"}
                            alt={review.movieId.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </Link>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/movies/${review.movieId._id}`} className="hover:text-yellow-400">
                          <h3 className="text-lg font-medium">{review.movieId?.title || "Unknown Movie"}</h3>
                        </Link>

                        <div className="flex items-center gap-1">
                          <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold">{review.rating}</span>
                          <span className="text-gray-400">/ 5</span>
                        </div>
                      </div>

                      <h4 className="font-medium mb-2">{review.title}</h4>
                      <p className="text-sm text-gray-300 mb-2">{review.content}</p>

                      <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        <div className="flex items-center gap-4">
                          <span>{review.helpfulCount || 0} helpful</span>
                          <button className="text-yellow-400 hover:underline">Edit</button>
                          <button className="text-red-400 hover:underline">Delete</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-purple-800/50 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium mb-4">You haven't written any reviews yet</h3>
              <p className="text-gray-300 mb-6">Start sharing your thoughts on movies you've watched!</p>
              <Link to="/movies" className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded">
                Browse Movies
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProfilePage

