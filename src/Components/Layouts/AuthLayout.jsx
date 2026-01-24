import React, { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import NavBar from '../NavBar'

const AuthLayout = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // If user is already logged in and not on verification page, redirect to appropriate dashboard
    if (!loading && user && !location.pathname.includes('/verify')) {
      console.log('AuthLayout: User already logged in, redirecting...')
      const destination = user.role === 'admin' ? '/admin' : '/dashboard'
      navigate(destination, { replace: true })
    }
  }, [user, loading, navigate, location.pathname])

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex items-center justify-center py-16">
        <div className="w-full mt-8 max-w-md p-6 bg-white rounded-lg shadow">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
