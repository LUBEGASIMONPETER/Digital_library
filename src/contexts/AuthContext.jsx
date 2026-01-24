import React, { createContext, useContext, useEffect, useState } from 'react'

import { apiBase } from '../lib/api'

const AuthContext = createContext(null)

// Helper to extract token from URL
const getTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('token')
}

// Helper to decode JWT payload
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (err) {
    console.error('Failed to decode JWT:', err)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('auth_user')
      return raw ? JSON.parse(raw) : null
    } catch (err) {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check for OAuth token in URL first
        const urlToken = getTokenFromUrl()
        
        if (urlToken) {
          console.log('Found OAuth token in URL, processing...')
          // Decode the token to get user info
          const decoded = decodeJwt(urlToken)
          
          if (decoded && decoded.id) {
            console.log('Decoded token for user:', decoded.email)
            // Store user from decoded token immediately to prevent logout
            const userFromToken = {
              id: decoded.id,
              email: decoded.email,
              role: decoded.role,
              name: decoded.name,
              token: urlToken
            }
            setUser(userFromToken)
            localStorage.setItem('auth_user', JSON.stringify(userFromToken))
            
            // Fetch full user profile from backend to get complete data
            try {
              const apiUrl = apiBase() || 'http://localhost:5000'
              const res = await fetch(`${apiUrl}/api/users/profile`, {
                headers: {
                  'Authorization': `Bearer ${urlToken}`,
                  'X-User-ID': decoded.id
                }
              })
              
              if (res.ok) {
                const userData = await res.json()
                const userWithId = { ...userData, id: userData._id || userData.id || decoded.id, token: urlToken }
                console.log('Full user profile loaded:', userWithId.email)
                setUser(userWithId)
                localStorage.setItem('auth_user', JSON.stringify(userWithId))
              } else {
                console.warn('Failed to fetch full profile, status:', res.status, '- keeping token user data')
                // Keep the user from decoded token - already set above
              }
            } catch (profileErr) {
              console.error('Failed to fetch full profile, using decoded token data:', profileErr)
              // Keep the user from decoded token - already set above
            }
          } else {
            console.error('Invalid token - could not decode')
          }
          
          // Clean the URL (remove token parameter) - do this AFTER setting user
          const cleanUrl = window.location.pathname
          window.history.replaceState({}, document.title, cleanUrl)
        } else {
          console.log('No OAuth token in URL, checking localStorage')
        }
      } catch (err) {
        console.error('Failed to initialize auth', err)
      } finally {
        setLoading(false)
      }
    }
    
    initAuth()
  }, [])

  useEffect(() => {
    // Only sync to localStorage for manual setUser calls (not during initial load)
    if (!loading && user && !getTokenFromUrl()) {
      try {
        localStorage.setItem('auth_user', JSON.stringify(user))
      } catch (err) {
        console.error('Failed to persist auth_user', err)
      }
    } else if (!loading && !user) {
      try {
        localStorage.removeItem('auth_user')
      } catch (err) {
        console.error('Failed to remove auth_user', err)
      }
    }
  }, [user, loading])

  const signOut = () => {
    // clear storage and local state
    try {
      localStorage.removeItem('auth_user')
      const keys = ['token', 'accessToken', 'auth', 'user', 'currentUser']
      keys.forEach(k => { try { localStorage.removeItem(k) } catch (e) {} })
      try { sessionStorage.removeItem('auth') } catch (e) {}
    } catch (err) {
      // ignore
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, setUser, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
