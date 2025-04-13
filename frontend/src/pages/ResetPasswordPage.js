import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { FiEye, FiEyeOff, FiAlertCircle, FiCheck, FiX } from "react-icons/fi"
import api from "../services/api"

const ResetPasswordPage = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenChecked, setTokenChecked] = useState(false)

  // Password validation
  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /[0-9]/.test(formData.password),
    hasSpecial: /[^A-Za-z0-9]/.test(formData.password),
    passwordsMatch: formData.password === formData.confirmPassword && formData.confirmPassword !== "",
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        await api.get(`/auth/reset-password/${token}`)
        setTokenValid(true)
      } catch (err) {
        setError("Invalid or expired password reset token")
        setTokenValid(false)
      } finally {
        setTokenChecked(true)
      }
    }

    verifyToken()
  }, [token])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isPasswordValid) {
      setError("Please fix the password issues before continuing")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      })

      // Redirect to login with success message
      navigate("/login", {
        state: {
          message: "Password has been reset successfully. You can now log in with your new password.",
        },
      })
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!tokenChecked) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-purple-800 rounded-lg shadow-lg p-8 text-center">
            <div className="text-center mb-8">
              <Link to="/" className="text-2xl font-bold text-white">
                Crictistaan
              </Link>
              <h1 className="text-xl font-semibold text-white mt-4">Reset Password</h1>
            </div>

            <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-6 text-white">{error}</div>

            <p className="text-white mb-6">
              The password reset link is invalid or has expired. Please request a new password reset link.
            </p>

            <Link
              to="/forgot-password"
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded inline-block"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    )
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">Password requirements:</p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center">
                  {passwordValidation.minLength ? (
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <FiX className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordValidation.minLength ? "text-green-400" : "text-gray-400"}>
                    At least 8 characters
                  </span>
                </li>
                <li className="flex items-center">
                  {passwordValidation.hasUppercase ? (
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <FiX className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordValidation.hasUppercase ? "text-green-400" : "text-gray-400"}>
                    At least one uppercase letter
                  </span>
                </li>
                <li className="flex items-center">
                  {passwordValidation.hasLowercase ? (
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <FiX className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordValidation.hasLowercase ? "text-green-400" : "text-gray-400"}>
                    At least one lowercase letter
                  </span>
                </li>
                <li className="flex items-center">
                  {passwordValidation.hasNumber ? (
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <FiX className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordValidation.hasNumber ? "text-green-400" : "text-gray-400"}>
                    At least one number
                  </span>
                </li>
                <li className="flex items-center">
                  {passwordValidation.hasSpecial ? (
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <FiX className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordValidation.hasSpecial ? "text-green-400" : "text-gray-400"}>
                    At least one special charactert one special character
                  </span>
                </li>
                <li className="flex items-center">
                  {passwordValidation.passwordsMatch ? (
                    <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <FiX className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={passwordValidation.passwordsMatch ? "text-green-400" : "text-gray-400"}>
                    Passwords match
                  </span>
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
              disabled={isSubmitting || !isPasswordValid}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </button>

            <div className="text-center text-sm text-gray-300">
              <Link to="/login" className="text-yellow-400 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage

