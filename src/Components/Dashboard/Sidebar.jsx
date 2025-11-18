import React from 'react'
import { Link, useLocation } from 'react-router-dom'

// Props:
// collapsed: boolean (desktop compact state)
// mobileOpen: boolean (mobile off-canvas open)
// onToggleCollapse: function to toggle collapsed state
// onClose: function to close mobile sidebar
const Sidebar = ({ collapsed = false, mobileOpen = false, onToggleCollapse = () => {}, onClose = () => {} }) => {
  const location = useLocation()
  
  // sidebar width classes
  const desktopWidthClass = collapsed ? 'md:w-20' : 'md:w-72'

  // mobile transform: when mobileOpen true show, else hide off-canvas
  const mobileTransformClass = mobileOpen ? 'translate-x-0' : '-translate-x-full'

  return (
    // fixed so content can scroll independently
    <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${mobileTransformClass} md:translate-x-0 ${desktopWidthClass}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Dashboard</h2>
                <p className="text-sm text-gray-500">Library</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}

          <div className="flex items-center space-x-2">
            {/* collapse button (desktop) */}
            <button 
              onClick={onToggleCollapse} 
              className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {collapsed ? (
                  <path d="M9 18L15 12L9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M15 18L9 12L15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
            {/* close on mobile */}
            <button 
              onClick={onClose} 
              className="md:hidden w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <SidebarLink 
            to="/dashboard" 
            label="Overview" 
            icon={
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="4" height="18" rx="1" />
                <rect x="10" y="8" width="4" height="13" rx="1" />
                <rect x="17" y="13" width="4" height="8" rx="1" />
              </svg>
            } 
            collapsed={collapsed} 
            isActive={location.pathname === '/dashboard'}
          />
          <SidebarLink 
            to="/dashboard/library" 
            label="Library" 
            icon={
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 5a2 2 0 012-2h11a2 2 0 012 2v13a1 1 0 01-1 1H6a1 1 0 01-1-1V5z" />
                <path d="M21 6h-2v12h2a1 1 0 001-1V7a1 1 0 00-1-1z" />
              </svg>
            } 
            collapsed={collapsed} 
            isActive={location.pathname.includes('/library')}
          />
          <SidebarLink 
            to="/dashboard/borrowed" 
            label="Borrowed Books" 
            icon={
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="8" strokeWidth="1.5" />
                <path d="M12 8v5l3 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            } 
            collapsed={collapsed} 
            isActive={location.pathname.includes('/borrowed')}
          />
          {/* <SidebarLink 
            to="/dashboard/reading-lists" 
            label="Reading Lists" 
            icon="📖" 
            collapsed={collapsed} 
            isActive={location.pathname.includes('/reading-lists')}
          /> */}
          <SidebarLink 
            to="/dashboard/analytics" 
            label="Analytics" 
            icon={
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3 17 9 11 13 15 21 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="21 21 21 7 7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            } 
            collapsed={collapsed} 
            isActive={location.pathname.includes('/analytics')}
          />
          <SidebarLink 
            to="/dashboard/settings" 
            label="Settings" 
            icon={
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 15.5A3.5 3.5 0 1112 8.5a3.5 3.5 0 010 7z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 015.27 17.9l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.21 6.8A2 2 0 016.91 4.1l.06.06a1.65 1.65 0 001.82.33h.09A1.65 1.65 0 0010.5 3H13.5a1.65 1.65 0 001.51.33h.09a1.65 1.65 0 001.82-.33l.06-.06A2 2 0 0119.79 6.9l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            } 
            collapsed={collapsed} 
            isActive={location.pathname.includes('/settings')}
          />
          
          {/* Divider */}
          <div className={`h-px bg-gray-200 my-4 ${collapsed ? 'mx-2' : 'mx-4'}`}></div>
          
          {/* Quick Actions */}
          <SidebarLink 
            to="/dashboard/support" 
            label="Help & Support" 
            icon={
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                <path d="M9.09 9a3 3 0 115.83 1c0 1.5-1.5 2-1.5 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M12 17h.01" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            } 
            collapsed={collapsed} 
            isActive={location.pathname.includes('/support')}
          />
          {/* <SidebarLink 
            to="/dashboard/feedback" 
            label="Send Feedback" 
            icon="💬" 
            collapsed={collapsed} 
            isActive={location.pathname.includes('/feedback')}
          /> */}
        </nav>

        {/* User Profile & Footer */}
        <div className="p-4 border-t border-gray-200">
          {!collapsed ? (
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer group">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">User Student</p>
                <p className="text-xs text-gray-500 truncate">A-Level Science</p>
              </div>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md mx-auto">
              U
            </div>
          )}
          
          {!collapsed && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} Kawempe Digital Library
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
      className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
        isActive 
          ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } ${collapsed ? 'justify-center' : ''}`}
    >
      <div className={`text-lg ${collapsed ? '' : 'mr-3'}`}>
        {icon}
      </div>
      {!collapsed && (
        <span className="font-medium flex-1">{label}</span>
      )}
      
      {/* Active indicator dot for collapsed state */}
      {collapsed && isActive && (
        <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
      )}
      
      {/* Hover arrow for expanded state */}
      {!collapsed && (
        <svg 
          className={`w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            isActive ? 'opacity-100 text-blue-500' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}
    </Link>
  )
}

export default Sidebar