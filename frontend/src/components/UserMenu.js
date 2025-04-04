"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FiUser, FiLogOut, FiHeart } from "react-icons/fi"
import { useAuth } from "../contexts/AuthContext"

const UserMenu = () => {
  const navigate = useNavigate()
  const { user, login, logout, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [loginError, setLoginError] = useState("")

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleLogout = async () => {
    await logout()
    setIsMenuOpen(false)
    navigate("/")
  }

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoginError("")

    try {
      await login(loginData.email, loginData.password)
      setIsLoginModalOpen(false)
      setLoginData({ email: "", password: "" })
    } catch (error) {
      setLoginError(error.message)
    }
  }

  return (
    <div className="relative">
      {user ? (
        <>
          <button onClick={toggleMenu} className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center">
            {user.profileImage ? (
              <img
                src={user.profileImage || "/placeholder.svg"}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <FiUser className="w-5 h-5 text-white" />
            )}
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-purple-950 ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <div className="px-4 py-2 border-b border-purple-800">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-purple-300 truncate">{user.email}</p>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-purple-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiUser className="mr-3 h-4 w-4 text-purple-300" />
                  Profile
                </Link>

                <Link
                  to="/watchlist"
                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-purple-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiHeart className="mr-3 h-4 w-4 text-purple-300" />
                  Watchlist
                </Link>

                {/* <Link
                  to="/history"
                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-purple-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiClock className="mr-3 h-4 w-4 text-purple-300" />
                  Watch History
                </Link> */}

                {/* <Link
                  to="/settings"
                  className="flex items-center px-4 py-2 text-sm text-white hover:bg-purple-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FiSettings className="mr-3 h-4 w-4 text-purple-300" />
                  Settings
                </Link> */}

                <div className="border-t border-purple-800 mt-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-purple-800"
                  >
                    <FiLogOut className="mr-3 h-4 w-4 text-purple-300" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 text-white border border-white rounded-md hover:bg-purple-800"
          >
            Sign In
          </button>
        </>
      )}

      {/* Login Modal - In a real app, you'd use a proper modal component */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Sign In</h2>

            {loginError && (
              <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 text-white text-sm">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full p-2 bg-purple-800 border border-purple-700 rounded text-white"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full p-2 bg-purple-800 border border-purple-700 rounded text-white"
                  required
                />
              </div>

              <div className="flex justify-between items-center mb-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Remember me</span>
                </label>
                <a href="#" className="text-sm text-yellow-400 hover:underline">
                  Forgot password?
                </a>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-4 py-2 mr-2 text-white hover:bg-purple-800 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu

