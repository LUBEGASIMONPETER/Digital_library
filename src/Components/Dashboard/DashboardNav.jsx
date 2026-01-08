import React, { useRef, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  Download,
  Heart,
  LogOut,
  HelpCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Trophy
} from 'lucide-react'

const DashboardNav = ({ onToggleSidebar, collapsed = false, user: propUser }) => {
  const [open, setOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [achievements, setAchievements] = useState([])
  const [currentAchievementIndex, setCurrentAchievementIndex] = useState(0)
  const menuRef = useRef(null)
  const notificationsRef = useRef(null)
  const searchRef = useRef(null)
  const navigate = useNavigate()
  const { user: authUser, signOut } = useAuth()

  // Fetch user's unlocked achievements
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await apiFetch('/api/users/achievements')
        if (res.ok) {
          const data = await res.json()
          const unlocked = (data.achievements || []).filter(a => a.unlocked)
          setAchievements(unlocked)
        }
      } catch (err) {
        console.error('Failed to fetch achievements for nav:', err)
      }
    }
    fetchAchievements()
  }, [])

  // Rotate through achievements every 3 seconds
  useEffect(() => {
    if (achievements.length <= 1) return
    const interval = setInterval(() => {
      setCurrentAchievementIndex(prev => (prev + 1) % achievements.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [achievements.length])

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target) && searchOpen) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [searchOpen])

  const user = propUser || authUser || {
    fullName: 'Alice Mwanga',
    school: 'Kawempe High School',
    level: 'A-Level Science'
  }

  const displayName = user?.name || user?.fullName || ''
  const displaySchool = user?.schoolName || user?.school || ''
  const initial = (displayName.charAt(0) || 'U').toUpperCase()

  const handleSignOut = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch (err) {
      // ignore if endpoint doesn't exist
    }

    // Clear auth data
    const keys = ['token', 'accessToken', 'auth', 'user', 'currentUser']
    keys.forEach(k => {
      try { localStorage.removeItem(k) } catch (e) { }
    })

    try { sessionStorage.removeItem('auth') } catch (e) { }
    try { signOut() } catch (e) { }
    navigate('/auth/login')
  }

  const notifications = [
    { id: 1, message: 'Your borrowed book is due tomorrow', type: 'warning', time: '5 min ago', read: false },
    { id: 2, message: 'New study materials available for Biology', type: 'info', time: '1 hour ago', read: true },
    { id: 3, message: 'Your reading list has been updated', type: 'success', time: '2 hours ago', read: true }
  ]

  const unreadCount = notifications.filter(n => !n.read).length
  const leftOffsetClass = collapsed ? 'md:left-20' : 'md:left-72'

  return (
    <nav 
      className={`fixed top-0 inset-x-0 md:right-0 ${leftOffsetClass} z-40 bg-white border-b border-gray-200 px-4 md:px-6 transition-all duration-300 ease-in-out`}
    >
      <div className="h-20 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-blue-600">
                Hello, <span className="text-blue-500">{displayName.split(' ')[0] || displayName}</span>
              </h1>
              {achievements.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-full">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span 
                    key={currentAchievementIndex}
                    className="text-xs font-medium text-amber-700 animate-fade-in"
                  >
                    {achievements[currentAchievementIndex]?.name}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {achievements.length > 0 
                ? `🏆 ${achievements.length} achievement${achievements.length > 1 ? 's' : ''} unlocked!`
                : 'Ready to continue your learning journey?'
              }
            </p>
          </div>
          
          <div className="md:hidden">
            <h3 className="text-base font-semibold text-blue-600">Hello, {displayName.split(' ')[0] || displayName}</h3>
            {achievements.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Trophy className="w-3 h-3 text-amber-500" />
                <span className="text-xs text-amber-600">{achievements[currentAchievementIndex]?.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Center Search - Desktop */}
        <div className="hidden md:block flex-1 max-w-2xl mx-8">
          <div ref={searchRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search books, authors, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                onFocus={() => setSearchOpen(true)}
              />
            </div>
            
            {searchOpen && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-700">Recent Searches</p>
                </div>
                <div className="p-2">
                  <div className="px-3 py-2 text-sm text-gray-500">Start typing to search...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          

          

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setOpen(!open)}
              className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-blue-50 transition-colors duration-200 group"
              aria-haspopup="true"
              aria-expanded={open}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_BACKEND_URL || ''}${user.avatarUrl}`} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  initial
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-blue-600 group-hover:text-blue-700">{displayName}</p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">{displaySchool}</p>
              </div>
              <ChevronDown className={`hidden md:block w-4 h-4 text-blue-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
                {/* User Info */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden">
                      {user.avatarUrl ? (
                        <img 
                          src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${import.meta.env.VITE_BACKEND_URL || ''}${user.avatarUrl}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        initial
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-blue-600 truncate">{displayName}</p>
                      <p className="text-sm text-blue-500 truncate">{displaySchool}</p>
                      <p className="text-xs text-gray-500">{user.level}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link 
                    to="/dashboard/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group"
                    onClick={() => setOpen(false)}
                  >
                    <User className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    <span>Profile</span>
                  </Link>

                  <Link 
                    to="/dashboard/settings" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group"
                    onClick={() => setOpen(false)}
                  >
                    <Settings className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    <span>Settings</span>
                  </Link>

                  <Link 
                    to="/dashboard/downloads" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group"
                    onClick={() => setOpen(false)}
                  >
                    <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    <span>Downloads</span>
                  </Link>

                  <Link 
                    to="/dashboard/favourites" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group"
                    onClick={() => setOpen(false)}
                  >
                    <Heart className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    <span>Favourites</span>
                  </Link>

                  <Link 
                    to="/dashboard/support" 
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 group"
                    onClick={() => setOpen(false)}
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                    <span>Help & Support</span>
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="border-t border-gray-200 p-2">
                  <button 
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200 group"
                  >
                    <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-600" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default DashboardNav