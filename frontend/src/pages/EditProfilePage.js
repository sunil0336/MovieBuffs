"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FiUser, FiMail, FiEdit2, FiSave, FiX, FiAlertCircle } from "react-icons/fi"
import { useAuth } from "../contexts/AuthContext"
import Header from "../components/Header"
import api from "../services/api"

const EditProfilePage = () => {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    bio: "",
    profileImage: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        bio: user.bio || "",
        profileImage: user.profileImage || "",
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setSuccess("")

    try {
      const res = await api.put("/users/profile", formData)
      setSuccess("Profile updated successfully")
      // Update user context if needed
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    setIsChangingPassword(true)
    setPasswordError("")
    setPasswordSuccess("")

    try {
      await api.put("/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setPasswordSuccess("Password changed successfully")
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      setPasswordError(err.response?.data?.error || "Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!user) {
    navigate("/login")
    return null
  }

  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

          <div className="bg-purple-800 rounded-lg shadow-lg p-6 mb-8">
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 text-white flex items-center">
                <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-green-900/50 border border-green-700 rounded-md p-3 mb-4 text-white">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">
                  Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 pl-10 bg-purple-900/50 border border-purple-700 rounded text-white"
                  />
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                </div>
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full p-2 pl-10 bg-purple-900/50 border border-purple-700 rounded text-white"
                  />
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Only letters, numbers, and underscores allowed</p>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full p-2 pl-10 bg-purple-900/50 border border-purple-700 rounded text-gray-400"
                  />
                  <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
                </div>
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
                  maxLength="200"
                ></textarea>
                <p className="text-xs text-gray-400 mt-1">{formData.bio.length}/200 characters</p>
              </div>

              <div>
                <label htmlFor="profileImage" className="block text-sm font-medium mb-1">
                  Profile Image URL
                </label>
                <input
                  id="profileImage"
                  name="profileImage"
                  type="text"
                  value={formData.profileImage}
                  onChange={handleChange}
                  className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-400 mt-1">Enter a URL to your profile image</p>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/profile")}
                  className="px-4 py-2 border border-white text-white hover:bg-purple-700 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded flex items-center"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Saving..."
                  ) : (
                    <>
                      <FiSave className="mr-1" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-purple-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Password</h2>
              <button
                type="button"
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-yellow-400 hover:text-yellow-300 flex items-center"
              >
                {showPasswordSection ? (
                  <>
                    <FiX className="mr-1" /> Cancel
                  </>
                ) : (
                  <>
                    <FiEdit2 className="mr-1" /> Change Password
                  </>
                )}
              </button>
            </div>

            {showPasswordSection && (
              <>
                {passwordError && (
                  <div className="bg-red-900/50 border border-red-700 rounded-md p-3 mb-4 text-white flex items-center">
                    <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div className="bg-green-900/50 border border-green-700 rounded-md p-3 mb-4 text-white">
                    {passwordSuccess}
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                      Current Password
                    </label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                      New Password
                    </label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-2 bg-purple-900/50 border border-purple-700 rounded text-white"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded"
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default EditProfilePage

