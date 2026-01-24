import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  
  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    console.log('RequireAuth: No user found, redirecting to login')
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }
  
  console.log('RequireAuth: User authenticated:', user.email)
  return children
}
