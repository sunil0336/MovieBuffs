import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import PrivateRoute from "./components/PrivateRoute"
import AdminRoute from "./components/AdminRoute"

// Pages
import HomePage from "./pages/HomePage"
import MoviesPage from "./pages/MoviesPage"
import MovieDetailPage from "./pages/MovieDetailPage"
import TopReviewsPage from "./pages/TopReviewsPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ProfilePage from "./pages/ProfilePage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import EditProfilePage from "./pages/EditProfilePage"
import WatchlistPage from "./pages/WatchlistPage"
import AdminDashboardPage from "./pages/admin/DashboardPage"
import AdminMoviesPage from "./pages/admin/MoviesPage"
import AdminReviewsPage from "./pages/admin/ReviewsPage"
import AdminUsersPage from "./pages/admin/UsersPage"
import NotFoundPage from "./pages/NotFoundPage"

import AdminTvShowFormPage from "./pages/admin/TvShowFormPage"
import AdminTvShowsPage from "./pages/admin/TvShowFormPage"
import AdminMovieFormPage from "./pages/admin/MovieFormPage"
import AdminNewsFormPage from "./pages/admin/NewsFormPage"
import AdminNewsPage from "./pages/admin/NewsPage"
import TvShowDetailPage from "./pages/TvShowDetailPage"
import TvShowsPage from "./pages/TvShowsPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/movies" element={<MoviesPage />} />
          <Route path="/movies/:id" element={<MovieDetailPage />} />
          <Route path="/tv-shows" element={<TvShowsPage />} />
          <Route path="/tv-shows/:id" element={<TvShowDetailPage />} />
          <Route path="/top-reviews" element={<TopReviewsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile/edit"
            element={
              <PrivateRoute>
                <EditProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <PrivateRoute>
                <WatchlistPage />
              </PrivateRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboardPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/movies"
            element={
              <AdminRoute>
                <AdminMoviesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tv-shows"
            element={
              <AdminRoute>
                <AdminTvShowsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <AdminRoute>
                <AdminReviewsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/movies/add"
            element={
              <AdminRoute>
                <AdminMovieFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/movies/edit/:id"
            element={
              <AdminRoute>
                <AdminMovieFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/news"
            element={
              <AdminRoute>
                <AdminNewsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/news/add"
            element={
              <AdminRoute>
                <AdminNewsFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/news/edit/:id"
            element={
              <AdminRoute>
                <AdminNewsFormPage />
              </AdminRoute>
            }
          />
          {/* Add these routes inside the Routes component, in the Admin routes section */}
          <Route
            path="/admin/tv-shows/add"
            element={
              <AdminRoute>
                <AdminTvShowFormPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/tv-shows/edit/:id"
            element={
              <AdminRoute>
                <AdminTvShowFormPage />
              </AdminRoute>
            }
          />

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App

