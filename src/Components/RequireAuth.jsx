import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null // or a spinner
  if (!user) return <Navigate to="/auth/login" replace />
  return children
}
