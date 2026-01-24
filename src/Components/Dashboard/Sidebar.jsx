import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
const APP_LOGO = "/APP_LOGO.png"
import {
  LayoutDashboard,
  Library,
  BarChart3,
  Settings,
  HelpCircle,
  BookOpen,
  User,
  Home,
  Menu,
  X,
  Heart,
  Download,
  Trophy
} from 'lucide-react'

const Sidebar = ({ collapsed = false, mobileOpen = false, onToggleCollapse = () => {}, onClose = () => {} }) => {
  const location = useLocation()
  const { user } = useAuth()
  const [activity, setActivity] = useState({ readingTime: '0m', pagesRead: 0 })
  
  const desktopWidthClass = collapsed ? 'md:w-20' : 'md:w-72'
  const mobileTransformClass = mobileOpen ? 'translate-x-0' : '-translate-x-full'

  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
    { to: '/dashboard/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { to: '/dashboard/library', label: 'Library', icon: <Library className="w-5 h-5" /> },
    { to: '/dashboard/favourites', label: 'Favourites', icon: <Heart className="w-5 h-5" /> },
    { to: '/dashboard/downloads', label: 'Downloads', icon: <Download className="w-5 h-5" /> },
    { to: '/dashboard/achievements', label: 'Achievements', icon: <Trophy className="w-5 h-5" /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    { to: '/dashboard/support', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
  ]

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await apiFetch('/api/users/today-activity')
        if (res.ok) {
          const data = await res.json()
          setActivity({
            readingTime: data.readingTime || '0m',
            pagesRead: data.pagesRead || 0
          })
        }
      } catch (err) {
        console.error('Fetch activity error:', err)
      }
    }
    fetchActivity()
  }, [location.pathname])

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${mobileTransformClass} md:translate-x-0 ${desktopWidthClass}`} style={{ overflow: 'visible' }}>
      <div className="h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`flex items-center p-6 border-b border-gray-200 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <Link to="/" className="flex items-center">
              <img className="h-8 mr-2" src={APP_LOGO} alt="APP_logo" />
              <span className="text-xl font-bold text-blue-800">Library</span>
            </Link>
          )}

          <div className="flex items-center gap-2">
            {/* Collapse button */}
            <button 
              onClick={onToggleCollapse}
              className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50 transition-colors duration-200"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-4 h-4 text-blue-600" />
            </button>
            {/* Close button for mobile */}
            <button 
              onClick={onClose}
              className="md:hidden w-8 h-8 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.to 
              : location.pathname.startsWith(item.to)
            
            return (
              <SidebarLink 
                key={item.to}
                to={item.to} 
                label={item.label} 
                icon={item.icon}
                collapsed={collapsed} 
                isActive={isActive}
              />
            )
          })}
          
          {/* Divider */}
          <div className={`h-px bg-gray-200 my-4 ${collapsed ? 'mx-2' : 'mx-4'}`}></div>
          
          {/* Quick Stats */}
          {!collapsed && (
            <div className="px-4 py-3 bg-blue-50/50 rounded-xl mx-2 mb-4 border border-blue-100">
              <p className="text-xs font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                Today's Activity
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-600">{activity.readingTime}</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Reading Time</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-blue-600">{activity.pagesRead}</p>
                  <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Pages Read</p>
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          {!collapsed ? (
            <Link to="/dashboard/profile" className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-600 truncate group-hover:text-blue-700">
                  {user?.name || 'Loading...'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                   {user?.level || user?.role || 'Member'}
                </p>
              </div>
            </Link>
          ) : (
            <Link to="/dashboard/profile" className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-white font-semibold mx-auto shadow-sm overflow-hidden">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Link>
          )}
          
          {!collapsed && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} Digital Library
              </p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function SidebarLink({ to, label, icon, collapsed, isActive }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center p-3 rounded-lg transition-all duration-200 group relative ${
        isActive 
          ? 'bg-blue-50 text-blue-600' 
          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
      } ${collapsed ? 'justify-center px-3' : 'px-4'}`}
    >
      <div className={`${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-700'} ${collapsed ? '' : 'mr-3'}`}>
        {icon}
      </div>
      
      {!collapsed && (
        <>
          <span className="font-medium text-sm flex-1">{label}</span>
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[9999] shadow-lg pointer-events-none">
          {label}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-blue-600 border-t-transparent border-b-transparent border-l-transparent"></div>
        </div>
      )}
    </Link>
  )
}

export default Sidebar