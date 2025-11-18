import React, { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'

// For now we accept a mock user object or fallback to a sample
const mockUser = { 
  fullName: 'Alice Mwanga',
  school: 'Kawempe High School',
  level: 'A-Level Science'
}

const DashboardNav = ({ onToggleSidebar, collapsed = false, user: propUser }) => {
  const [open, setOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const menuRef = useRef(null)
  const notificationsRef = useRef(null)
  const navigate = useNavigate()
  const { user: authUser, signOut } = useAuth()

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const user = propUser || authUser || mockUser
  const displayName = user?.name || user?.fullName || ''
  const displaySchool = user?.schoolName || user?.school || ''
  const initial = (displayName.charAt(0) || 'U').toUpperCase()

  const handleSignOut = async () => {
    // Clear common client-side auth storage and attempt server-side logout if available.
    try {
      // Attempt server logout (optional; endpoint may not exist yet)
      try {
  await apiFetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      } catch (err) {
        // ignore - backend may not implement logout yet
      }

      // Remove common localStorage keys used for auth (non-destructive if not present)
      const keys = ['token', 'accessToken', 'auth', 'user', 'currentUser']
      keys.forEach(k => {
        try { localStorage.removeItem(k) } catch (e) { /* ignore */ }
      })

      // Optionally clear sessionStorage as well
      try { sessionStorage.removeItem('auth') } catch (e) { /* ignore */ }

      // Notify auth context to clear user
      try { signOut() } catch (e) { /* ignore */ }
      // Navigate to login page
      navigate('/auth/login')
    } catch (err) {
      console.error('Sign out failed', err)
      // Fallback navigation
      navigate('/auth/login')
    }
  }

  const notifications = [
    { id: 1, message: 'Your borrowed book is due tomorrow', type: 'warning', time: '5 min ago' },
    { id: 2, message: 'New study materials available for Biology', type: 'info', time: '1 hour ago' },
    { id: 3, message: 'Your reading list has been updated', type: 'success', time: '2 hours ago' }
  ]

  const unreadNotifications = notifications.filter(n => n.type === 'warning').length

  // left offset classes for fixed nav when sidebar is present on md+
  // keep nav full-width on small devices and offset only on md+
  const leftOffsetClass = collapsed ? 'md:left-16' : 'md:left-64'

  return (
    <div className={`fixed top-0 inset-x-0 md:right-0 ${leftOffsetClass} z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between flex-wrap md:flex-nowrap gap-2 md:gap-0 shadow-sm`}>
      {/* Left Section - Mobile Menu & Welcome */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={onToggleSidebar} 
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="hidden md:block">
          <h1 className="text-xl font-bold text-gray-900">Welcome back, {displayName.split(' ')[0] || displayName}! 👋</h1>
          <p className="text-sm text-gray-500">Ready to continue your learning journey?</p>
        </div>
        
        <div className="md:hidden">
          <h3 className="text-lg font-semibold text-gray-900">{displayName.split(' ')[0] || displayName}</h3>
        </div>
      </div>

      {/* Right Section - Actions & User Menu */}
      <div className="flex items-center space-x-4">
        {/* Search Button */}
          <button className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-xl border border-gray-300 hover:border-gray-400 transition-colors duration-200 text-gray-600 hover:text-gray-700">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-sm">Search...</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setNotificationsOpen(v => !v)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            aria-label="Notifications"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.24 8.56a5.97 5.97 0 01-4.66-6.24M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

            {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-full max-w-xs md:max-w-sm bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                <p className="text-sm text-gray-500">{notifications.length} unread</p>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-200 ${
                      notification.type === 'warning' ? 'bg-yellow-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        notification.type === 'warning' ? 'bg-yellow-500' :
                        notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-gray-50">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium py-2">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setOpen(v => !v)} 
            aria-haspopup="true" 
            aria-expanded={open}
            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md group-hover:shadow-lg transition-shadow duration-200">
              {initial}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">{displaySchool}</p>
            </div>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {open && (
            <div className="absolute right-2 md:right-0 mt-2  max-w-xs md:w-64 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              {/* User Info */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-sm text-gray-600 truncate">{displaySchool}</p>
                    <p className="text-xs text-gray-500">{user.level}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link 
                  to="/dashboard/profile" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>My Profile</span>
                </Link>

                <Link 
                  to="/dashboard/settings" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </Link>

                <Link 
                  to="/dashboard/downloads" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Downloads</span>
                </Link>

                <Link 
                  to="/dashboard/favourites" 
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={() => setOpen(false)}
                >
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>Favourites</span>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="border-t border-gray-200 p-2">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardNav