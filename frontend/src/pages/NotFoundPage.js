import { Link } from "react-router-dom"
import Header from "../components/Header"

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-purple-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-medium mb-8">Page Not Found</h2>
        <p className="text-lg text-gray-300 mb-8 max-w-md">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg font-medium">
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage

