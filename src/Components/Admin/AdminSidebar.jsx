// AdminSidebar.jsx
import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const AdminSidebar = ({ collapsed = false, mobileOpen = false, onToggleCollapse = () => {}, onClose = () => {} }) => {
  const location = useLocation()
  const desktopWidthClass = collapsed ? 'md:w-20' : 'md:w-80'
  const mobileTransformClass = mobileOpen ? 'translate-x-0' : '-translate-x-full'

  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: DashboardIcon, isActive: location.pathname === '/admin' },
    { to: "/admin/users", label: "User Management", icon: UsersIcon, isActive: location.pathname.includes('/admin/users') },
    { to: "/admin/books", label: "Book Catalog", icon: BooksIcon, isActive: location.pathname.includes('/admin/books') },
    { to: "/admin/analytics", label: "Analytics", icon: AnalyticsIcon, isActive: location.pathname.includes('/admin/analytics') },
    { to: "/admin/reports", label: "Reports", icon: ReportsIcon, isActive: location.pathname.includes('/admin/reports') },
    { to: "/admin/settings", label: "Settings", icon: SettingsIcon, isActive: location.pathname.includes('/admin/settings') },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${mobileTransformClass} md:translate-x-0 ${desktopWidthClass} shadow-xl`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            {!collapsed ? (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <LibraryIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900">Kawempe Library</h2>
                  <p className="text-sm text-gray-500 font-medium">Admin Portal</p>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto">
                <LibraryIcon className="w-6 h-6 text-white" />
              </div>
            )}

            <div className="flex items-center space-x-1">
              <button 
                onClick={onToggleCollapse} 
                className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-xl hover:bg-gray-100 transition-colors duration-200" 
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronIcon collapsed={collapsed} />
              </button>
              <button 
                onClick={onClose} 
                className="md:hidden w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center transition-colors duration-200" 
                aria-label="Close sidebar"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
            {menuItems.map((item) => (
              <AdminLink 
                key={item.to}
                to={item.to}
                label={item.label}
                icon={item.icon}
                collapsed={collapsed}
                isActive={item.isActive}
              />
            ))}
            
            <div className={`h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6 ${collapsed ? 'mx-2' : 'mx-4'}`}></div>
            
            <AdminLink 
              to="/dashboard" 
              label="Back to Dashboard" 
              icon={DashboardReturnIcon}
              collapsed={collapsed} 
              isActive={location.pathname.includes('/dashboard')}
              isReturn={true}
            />
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            {!collapsed ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">Kawempe Community Library</p>
                <p className="text-xs text-gray-500 mt-1">© {new Date().getFullYear()} All rights reserved</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs text-gray-400">©{new Date().getFullYear()}</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}

function AdminLink({ to, label, icon: Icon, collapsed, isActive, isReturn = false }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden ${
        isActive 
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
      } ${collapsed ? 'justify-center' : ''} ${isReturn ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' : ''}`}
    >
      {/* Active indicator */}
      {isActive && !collapsed && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-r-full"></div>
      )}
      
      <div className={`flex items-center justify-center ${collapsed ? '' : 'mr-4'} transition-transform duration-200 group-hover:scale-110`}>
        <Icon className={`w-5 h-5 ${isReturn ? 'text-amber-600' : isActive ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
      </div>
      
      {!collapsed && (
        <span className={`font-semibold flex-1 ${isReturn ? 'text-amber-700' : ''}`}>{label}</span>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {label}
        </div>
      )}
    </Link>
  )
}

// Icons as React components
const DashboardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10" />
  </svg>
)

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
)

const BooksIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
)

const AnalyticsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const ReportsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const LibraryIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
  </svg>
)

const DashboardReturnIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
  </svg>
)

const ChevronIcon = ({ collapsed }) => (
  <svg className="w-5 h-5 text-gray-500 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default AdminSidebar;