"use client"

import { useState } from "react"
import { FiX, FiShare2, FiFacebook, FiTwitter, FiLink, FiDownload } from "react-icons/fi"
import { FaWhatsapp } from "react-icons/fa"

const ShareModal = ({ isOpen, onClose, type, id, title }) => {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const shareUrl = `${window.location.origin}/${type === "movie" ? "movies" : "reviews"}/${id}`
  const shareTitle =
    type === "movie" ? `Check out ${title} on Crictistaan` : `Read this review of ${title} on Crictistaan`

  const shareImage = `${process.env.REACT_APP_API_URL}/share/${type}/${id}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadImage = () => {
    window.open(shareImage, "_blank")
  }

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank")
  }

  const handleTwitterShare = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
    )
  }

  const handleWhatsAppShare = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`, "_blank")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-800 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-purple-700">
          <h3 className="text-lg font-medium flex items-center">
            <FiShare2 className="mr-2" /> Share {type === "movie" ? "Movie" : "Review"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <img
              src={shareImage || "/placeholder.svg"}
              alt={`Share ${type}`}
              className="w-full h-auto rounded-lg border border-purple-700"
            />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <button
              onClick={handleFacebookShare}
              className="flex flex-col items-center justify-center p-3 bg-purple-700 hover:bg-purple-600 rounded-lg"
            >
              <FiFacebook className="w-6 h-6 mb-1" />
              <span className="text-xs">Facebook</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="flex flex-col items-center justify-center p-3 bg-purple-700 hover:bg-purple-600 rounded-lg"
            >
              <FiTwitter className="w-6 h-6 mb-1" />
              <span className="text-xs">Twitter</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center justify-center p-3 bg-purple-700 hover:bg-purple-600 rounded-lg"
            >
              <FaWhatsapp className="w-6 h-6 mb-1" />
              <span className="text-xs">WhatsApp</span>
            </button>

            <button
              onClick={handleDownloadImage}
              className="flex flex-col items-center justify-center p-3 bg-purple-700 hover:bg-purple-600 rounded-lg"
            >
              <FiDownload className="w-6 h-6 mb-1" />
              <span className="text-xs">Download</span>
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 bg-purple-900 border border-purple-700 rounded-l text-white"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-r flex items-center"
            >
              <FiLink className="mr-1" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareModal

