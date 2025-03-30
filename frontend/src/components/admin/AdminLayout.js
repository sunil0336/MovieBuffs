"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { FiHome, FiFilm, FiStar, FiUsers, FiSettings, FiMenu, FiX, FiLogOut } from "react-icons/fi"
import { useAuth } from "../../contexts/AuthContext"

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const navItems = [
    { path: "/admin", icon: <FiHome className="w-5 h-5" />, label: "Dashboard" },
    { path: "/admin/movies", icon: <FiFilm className="w-5 h-5" />, label: "Movies" },
    { path: "/admin/reviews", icon: <FiStar className="w-5 h-5" />, label: "Reviews" },
    { path: "/admin/users", icon: <FiUsers className="w-5 h-5" />, label: "Users" },
    { path: "/admin/settings", icon: <FiSettings className="w-5 h-5" />, label: "Settings" },
  ]

  return (
    <div className="min-h-screen bg-purple-900 text-white flex">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-purple-950 border-r border-purple-800">
        <div className="p-4 border-b border-purple-800">
          <Link to="/" className="text-xl font-bold">
            Crictistaan Admin
          </Link>
        </div>

        <nav className="flex-1 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 ${
                    location.pathname === item.path ? "bg-purple-800 text-yellow-400" : "hover:bg-purple-800/50"
                  }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-purple-800">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-700 rounded-full mr-2 flex items-center justify-center">
              {user?.profileImage ? (
                <img
                  src={user.profileImage || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.name?.charAt(0) || "A"
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{user?.name || "Admin"}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white" title="Logout">
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="md:hidden bg-purple-950 border-b border-purple-800 p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
            {isSidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
          </button>

          <Link to="/" className="text-xl font-bold">
            Crictistaan
          </Link>

          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                user?.name?.charAt(0) || "A"
              )}
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-purple-950 rounded-md shadow-lg z-10">
                <div className="p-3 border-b border-purple-800">
                  <p className="font-medium">{user?.name || "Admin"}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 hover:bg-purple-800 rounded-md flex items-center"
                  >
                    <FiLogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Mobile sidebar */}
        {isSidebarOpen && (
          <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20">
            <div className="w-64 h-full bg-purple-950 p-4">
              <div className="flex justify-between items-center mb-6">
                <Link to="/" className="text-xl font-bold">
                  Crictistaan Admin
                </Link>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <nav>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center px-4 py-2 ${
                          location.pathname === item.path ? "bg-purple-800 text-yellow-400" : "hover:bg-purple-800/50"
                        }`}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout

