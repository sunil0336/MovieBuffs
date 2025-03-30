"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { FiAlertCircle, FiMail } from "react-icons/fi"
import api from "../services/api"

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setMessage("")

    try {
      const response = await api.post("/auth/forgot-password", { email })
      setEmailSent(true)
      setMessage("Password reset email sent. Please check your inbox.")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send reset email. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-purple-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-bold text-white">
              Crictistaan
            </Link>
            <h1 className="text-xl font-semibold text-white mt-4">Reset Your Password</h1>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 text-white flex items-center">
              <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="bg-green-900/50 border border-green-700 rounded-md p-3 mb-4 text-white">{message}</div>
          )}

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 pl-10 bg-purple-900/50 border border-purple-700 rounded text-white"
                    placeholder="your@email.com"
                  />
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                </div>
                <p className="mt-2 text-sm text-purple-300">We'll send you a link to reset your password.</p>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              <div className="text-center text-sm text-gray-300">
                Remember your password?{" "}
                <Link to="/login" className="text-yellow-400 hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <p className="text-white mb-6">
                Check your email for a link to reset your password. If it doesn't appear within a few minutes, check
                your spam folder.
              </p>
              <Link to="/login" className="text-yellow-400 hover:underline">
                Return to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage

