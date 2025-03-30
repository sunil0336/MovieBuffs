"use client"

import { useState, useEffect } from "react"
import { FiSearch, FiFilter, FiX, FiMail, FiLock, FiUnlock } from "react-icons/fi"
import AdminLayout from "../../components/admin/AdminLayout"
import api from "../../services/api"
import { formatDate } from "../../utils/formatters"

const AdminUsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    sort: "newest",
  })

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)

      let queryParams = `page=${page}&limit=10`
      if (filters.search) queryParams += `&search=${filters.search}`
      if (filters.role) queryParams += `&role=${filters.role}`
      if (filters.sort) queryParams += `&sort=${filters.sort}`

      const res = await api.get(`/admin/users?${queryParams}`)

      setUsers(res.data.users)
      setPagination({
        page: res.data.pagination.page,
        pages: res.data.pagination.pages,
        total: res.data.pagination.total,
      })
    } catch (err) {
      setError("Failed to load users")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handlePageChange = (newPage) => {
    fetchUsers(newPage)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleFilterSubmit = (e) => {
    e.preventDefault()
    fetchUsers(1)
  }

  const handleClearFilters = () => {
    setFilters({
      search: "",
      role: "",
      sort: "newest",
    })
    fetchUsers(1)
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      await api.put(`/admin/users/${userId}/status`, { status: newStatus })

      setUsers(users.map((user) => (user._id === userId ? { ...user, status: newStatus } : user)))
    } catch (err) {
      console.error("Error updating user status:", err)
      alert("Failed to update user status")
    }
  }

  const handleToggleAdminRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin"
      await api.put(`/admin/users/${userId}/role`, { role: newRole })

      setUsers(users.map((user) => (user._id === userId ? { ...user, role: newRole } : user)))
    } catch (err) {
      console.error("Error updating user role:", err)
      alert("Failed to update user role")
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <div className="text-sm text-gray-300">Total: {pagination.total} users</div>
      </div>

      <div className="bg-purple-800 rounded-lg p-4 mb-6">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by name, username or email..."
                  className="w-full p-2 pl-8 bg-purple-900 border border-purple-700 rounded text-white"
                />
                <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" />
              </div>
            </div>

            <div className="w-32">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="w-full p-2 bg-purple-900 border border-purple-700 rounded text-white"
              >
                <option value="">All</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                name="sort"
                value={filters.sort}
                onChange={handleFilterChange}
                className="w-full p-2 bg-purple-900 border border-purple-700 rounded text-white"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="mostReviews">Most Reviews</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm bg-purple-700 hover:bg-purple-600 rounded flex items-center"
            >
              <FiX className="mr-1" /> Clear Filters
            </button>

            <button
              type="submit"
              className="px-4 py-1 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center"
            >
              <FiFilter className="mr-1" /> Filter
            </button>
          </div>
        </form>
      </div>

      {error && <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 text-white">{error}</div>}

      <div className="bg-purple-800 rounded-lg overflow-hidden shadow-lg mb-6">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-purple-700/50 rounded"></div>
              ))}
            </div>
          </div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-purple-900/50 text-left">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Reviews</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-700/30">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-purple-700/30">
                    <td className="p-4">
                      <div className="flex items-center">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage || "/placeholder.svg"}
                            alt={user.name}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-600 mr-3 flex items-center justify-center">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-gray-300">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <a href={`mailto:${user.email}`} className="hover:text-yellow-400 flex items-center">
                        <FiMail className="mr-1" /> {user.email}
                      </a>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          user.role === "admin" ? "bg-red-500/20 text-red-300" : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-300">{formatDate(user.createdAt)}</td>
                    <td className="p-4">{user.reviewCount || 0}</td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleUserStatus(user._id, user.status)}
                          className={`p-1.5 rounded ${
                            user.status === "active" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                          }`}
                          title={user.status === "active" ? "Deactivate User" : "Activate User"}
                        >
                          {user.status === "active" ? <FiLock className="w-4 h-4" /> : <FiUnlock className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleToggleAdminRole(user._id, user.role)}
                          className={`p-1.5 rounded ${
                            user.role === "admin"
                              ? "bg-blue-600 hover:bg-blue-700"
                              : "bg-purple-600 hover:bg-purple-700"
                          }`}
                          title={user.role === "admin" ? "Remove Admin Role" : "Make Admin"}
                        >
                          {user.role === "admin" ? "User" : "Admin"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-300">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex justify-center">
          <div className="flex space-x-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              First
            </button>
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <div className="px-3 py-1 bg-yellow-500 text-black rounded">
              {pagination.page} of {pagination.pages}
            </div>

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              Next
            </button>
            <button
              onClick={() => handlePageChange(pagination.pages)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 bg-purple-800 hover:bg-purple-700 rounded disabled:opacity-50"
            >
              Last
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminUsersPage

