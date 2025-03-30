"use client"
import { Navigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/login" />
  }

  return children
}

export default AdminRoute

