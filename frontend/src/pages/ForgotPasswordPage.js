import { useState } from "react"
import { Link } from "react-router-dom"
import { FiAlertCircle, FiLock, FiKey, FiEye, FiEyeOff, FiCheck, FiX } from "react-icons/fi"
import api from "../services/api"
import Header from "../components/Header"

const ForgotPasswordPage = () => {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const passwordValidation = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    passwordsMatch: password === confirmPassword,
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setMessage("")

    try {
      await api.post("/auth/forgot-password", { email })
      setStep(2)
      setMessage("OTP sent (check console on server)")
    } catch (err) {
      setError(err.response?.data?.error || "Failed to generate OTP")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setMessage("")

    try {
      await api.post("/auth/reset-password", { email, otp, password })
      setMessage("Password reset successful! You can now log in.")
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reset password")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-purple-900 flex items-center justify-center px-4">
      <div className="absolute top-0 w-full px-10 text-xl"><Header /></div>
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

          {step === 1 && (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
                  placeholder="Enter your registered email"
                />
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-white mb-1">Enter OTP</label>
                <div className="relative">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full p-2 pl-10 bg-purple-900/50 border border-purple-700 rounded text-white"
                    placeholder="Enter OTP from console"
                  />
                  <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-1">New Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 pl-10 pr-10 bg-purple-900/50 border border-purple-700 rounded text-white"
                    placeholder="New password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                  <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                </div>
              </div>

              <div>
  <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-1">
    Confirm Password
  </label>
  <div className="relative">
    <input
      id="confirmPassword"
      name="confirmPassword"
      type={showConfirmPassword ? "text" : "password"}
      required
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="w-full p-2 pl-10 pr-10 bg-purple-900/50 border border-purple-700 rounded text-white"
      placeholder="Confirm password"
    />
    <button
      type="button"
      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    >
      {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
    </button>
    <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
  </div>
</div>


              {/* Password Validation */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-white">Password requirements:</p>
                <ul className="space-y-1 text-sm">
                  {[
                    { valid: passwordValidation.minLength, text: "At least 8 characters" },
                    { valid: passwordValidation.hasUppercase, text: "At least one uppercase letter" },
                    { valid: passwordValidation.hasLowercase, text: "At least one lowercase letter" },
                    { valid: passwordValidation.hasNumber, text: "At least one number" },
                    { valid: passwordValidation.hasSpecial, text: "At least one special character" },
                    { valid: passwordValidation.passwordsMatch, text: "Passwords match" },
                  ].map(({ valid, text }, i) => (
                    <li key={i} className="flex items-center">
                      {valid ? (
                        <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                      ) : (
                        <FiX className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className={valid ? "text-green-400" : "text-gray-400"}>{text}</span>
                    </li>
                  ))}
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
          )}

          {step === 3 && (
            <div className="text-center">
              <p className="text-white mb-6">Password reset successful!</p>
              <Link to="/login" className="text-yellow-400 hover:underline">Go to Login</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordPage
