import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('auth_user')
      if (raw) {
        setUser(JSON.parse(raw))
      }
    } catch (err) {
      console.error('Failed to read auth_user from localStorage', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    try {
      if (user) localStorage.setItem('auth_user', JSON.stringify(user))
      else localStorage.removeItem('auth_user')
    } catch (err) {
      console.error('Failed to persist auth_user', err)
    }
  }, [user])

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
