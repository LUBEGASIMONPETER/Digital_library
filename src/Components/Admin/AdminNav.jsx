import React, { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Home,
  Shield,
  Search
} from 'lucide-react'

const AdminNav = ({ onToggleSidebar, collapsed = false }) => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const menuRef = useRef(null)
  const notificationsRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/admin') return 'Dashboard Overview'
    if (path.includes('/admin/users')) return 'User Management'
    if (path.includes('/admin/books')) return 'Book Catalog'
    if (path.includes('/admin/analytics')) return 'Analytics'
    if (path.includes('/admin/reports')) return 'Reports & Insights'
    if (path.includes('/admin/settings')) return 'System Settings'
    return 'Admin Panel'
  }

  const getPageDescription = () => {
    const path = location.pathname
    if (path === '/admin') return 'System overview and key metrics'
    if (path.includes('/admin/users')) return 'Manage user accounts and permissions'
    if (path.includes('/admin/books')) return 'Manage book catalog and content'
    if (path.includes('/admin/analytics')) return 'View system analytics and trends'
    if (path.includes('/admin/reports')) return 'Generate and view reports'
    if (path.includes('/admin/settings')) return 'Configure system settings'
    return 'Administration interface'
  }

  const notifications = [
    { id: 1, message: 'New user registration requires approval', time: '5 min ago', read: false, type: 'user' },
    { id: 2, message: 'System backup completed successfully', time: '1 hour ago', read: true, type: 'system' },
    { id: 3, message: '3 books added to catalog', time: '2 hours ago', read: true, type: 'book' }
  ]

  const unreadCount = notifications.filter(n => !n.read).length
  const userName = user?.name || 'Admin User'
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const leftOffsetClass = collapsed ? 'md:left-20' : 'md:left-72'

  const handleSignOut = async () => {
    try {
      await signOut()
      navigate('/auth/login')
    } catch (error) {
      console.error('Sign out failed:', error)
      navigate('/auth/login')
    }
  }

  return (
    <nav className={`fixed top-0 inset-x-0 md:right-0 ${leftOffsetClass} z-40 bg-white border-b border-gray-200 px-4 md:px-6 h-20 flex items-center justify-between transition-all duration-300 ease-in-out`}>
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-gray-900">{getPageTitle()}</h1>
          <p className="text-sm text-gray-500 hidden md:block">{getPageDescription()}</p>
        </div>
      </div>

      {/* Center Search - Desktop */}
      <div className="hidden md:block flex-1 max-w-2xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users, books, or reports..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Mobile Search */}
        <button 
          onClick={() => {/* Implement mobile search */}}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600 group-hover:text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          notification.type === 'user' ? 'bg-blue-100' :
                          notification.type === 'system' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          <Shield className={`w-4 h-4 ${
                            notification.type === 'user' ? 'text-blue-600' :
                            notification.type === 'system' ? 'text-green-600' : 'text-purple-600'
                          }`} />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-3 bg-gray-50 border-t border-gray-200">
                <Link 
                  to="/admin/notifications" 
                  className="block text-center text-sm text-gray-700 hover:text-gray-900 font-medium py-2"
                  onClick={() => setShowNotifications(false)}
                >
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            aria-haspopup="true"
            aria-expanded={showUserMenu}
          >
            <div className="w-9 h-9 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-semibold">
              {userInitials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <ChevronDown className={`hidden md:block w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              {/* User Info */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-semibold">
                    {userInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{userName}</p>
                    <p className="text-sm text-gray-600 truncate">{user?.email || 'admin@library.org'}</p>
                    <p className="text-xs text-gray-500">System Administrator</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                

                <Link 
                  to="/admin/settings" 
                  className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200 group"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  <span>Settings</span>
                </Link>

                <div className="h-px bg-gray-200 my-2"></div>

                
              </div>

              {/* Sign Out */}
              <div className="border-t border-gray-200 p-2">
                <button 
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 group"
                >
                  <LogOut className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default AdminNav