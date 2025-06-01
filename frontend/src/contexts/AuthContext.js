import React, { createContext, useState, useEffect } from "react"
import axios from "axios"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Configure axios
  axios.defaults.baseURL = process.env.REACT_APP_API_URL
  axios.defaults.withCredentials = true

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await axios.get("/auth/me")
        setUser(res.data.user)
      } catch (err) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const register = async (userData) => {
    setLoading(true)
    setError(null)

    try {
      const res = await axios.post("/auth/register", userData)
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed")
      throw new Error(err.response?.data?.error || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const res = await axios.post("/auth/login", { email, password })
      setUser(res.data.user)
      return res.data.user
    } catch (err) {
      setError(err.response?.data?.error || "Login failed")
      throw new Error(err.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)

    try {
      await axios.post("/auth/logout")
      setUser(null)
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => React.useContext(AuthContext)

