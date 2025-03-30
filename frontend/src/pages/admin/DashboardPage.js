"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { FiFilm, FiStar, FiUsers, FiPieChart, FiBarChart2, FiTrendingUp } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalReviews: 0,
    totalUsers: 0,
    recentMovies: [],
    topRatedMovies: [],
    mostReviewedMovies: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats")
        setStats(res.data)
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link} className="bg-purple-800 rounded-lg p-6 shadow-lg hover:bg-purple-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">{title}</h3>
        <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold">{loading ? "-" : value}</p>
    </Link>
  )

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-300">Welcome to the admin dashboard. Manage your movie review website here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Movies"
          value={stats.totalMovies}
          icon={<FiFilm className="w-6 h-6" />}
          color="bg-blue-500/20 text-blue-400"
          link="/admin/movies"
        />
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews}
          icon={<FiStar className="w-6 h-6" />}
          color="bg-yellow-500/20 text-yellow-400"
          link="/admin/reviews"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<FiUsers className="w-6 h-6" />}
          color="bg-green-500/20 text-green-400"
          link="/admin/users"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-purple-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Movies</h3>
            <FiTrendingUp className="w-5 h-5 text-purple-300" />
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-purple-700/50 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentMovies.map((movie) => (
                <Link
                  key={movie._id}
                  to={`/admin/movies/edit/${movie._id}`}
                  className="flex items-center justify-between p-2 hover:bg-purple-700/50 rounded"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-12 bg-purple-700 rounded mr-3 overflow-hidden">
                      {movie.poster && (
                        <img
                          src={movie.poster || "/placeholder.svg"}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{movie.title}</h4>
                      <p className="text-xs text-gray-400">{new Date(movie.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <FiStar className="w-4 h-4 mr-1" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-purple-800 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Top Rated Movies</h3>
            <FiBarChart2 className="w-5 h-5 text-purple-300" />
          </div>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-purple-700/50 rounded"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topRatedMovies.map((movie) => (
                <Link
                  key={movie._id}
                  to={`/admin/movies/edit/${movie._id}`}
                  className="flex items-center justify-between p-2 hover:bg-purple-700/50 rounded"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-12 bg-purple-700 rounded mr-3 overflow-hidden">
                      {movie.poster && (
                        <img
                          src={movie.poster || "/placeholder.svg"}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{movie.title}</h4>
                      <p className="text-xs text-gray-400">{movie.year}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <FiStar className="w-4 h-4 mr-1 fill-yellow-400" />
                    <span className="font-bold">{movie.rating.toFixed(1)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-purple-800 rounded-lg p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Most Reviewed Movies</h3>
          <FiPieChart className="w-5 h-5 text-purple-300" />
        </div>
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-purple-700/50 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.mostReviewedMovies.map((movie) => (
              <Link
                key={movie._id}
                to={`/admin/movies/edit/${movie._id}`}
                className="flex items-center p-2 hover:bg-purple-700/50 rounded"
              >
                <div className="w-10 h-15 bg-purple-700 rounded mr-3 overflow-hidden">
                  {movie.poster && (
                    <img
                      src={movie.poster || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{movie.title}</h4>
                  <p className="text-xs text-gray-400">{movie.reviewCount} reviews</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default DashboardPage

