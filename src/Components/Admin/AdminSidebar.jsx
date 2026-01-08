import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  BarChart3,
  FileText,
  Settings,
  Library,
  Menu,
  User,
  X,
  Shield,
  Home
} from 'lucide-react'

const AdminSidebar = ({ collapsed = false, mobileOpen = false, onToggleCollapse = () => {}, onClose = () => {} }) => {
  const location = useLocation()
  
  const desktopWidthClass = collapsed ? 'md:w-20' : 'md:w-72'
  const mobileTransformClass = mobileOpen ? 'translate-x-0' : '-translate-x-full'

  const menuItems = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, isActive: location.pathname === '/admin' },
    { to: "/admin/users", label: "User Management", icon: Users, isActive: location.pathname.includes('/admin/users') },
    { to: "/admin/books", label: "Book Catalog", icon: BookOpen, isActive: location.pathname.includes('/admin/books') },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3, isActive: location.pathname.includes('/admin/analytics') },
    { to: "/admin/reports", label: "Reports", icon: FileText, isActive: location.pathname.includes('/admin/reports') },
    { to: "/admin/settings", label: "Settings", icon: Settings, isActive: location.pathname.includes('/admin/settings') },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out ${mobileTransformClass} md:translate-x-0 ${desktopWidthClass}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className={`flex items-center p-6 border-b border-gray-200 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
                  <p className="text-xs text-gray-500">System Administration</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              {/* Collapse button */}
              <button 
                onClick={onToggleCollapse}
                className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-500" />
              </button>
              {/* Close button for mobile */}
              <button 
                onClick={onClose}
                className="md:hidden w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
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
            
            {/* Divider */}
            <div className={`h-px bg-gray-200 my-4 ${collapsed ? 'mx-2' : 'mx-4'}`}></div>
            
            {/* Admin Status */}
            {!collapsed && (
              <div className="px-4 py-3 bg-gray-50 rounded-lg mx-2 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-gray-600" />
                  <p className="text-xs font-medium text-gray-700">Admin Status</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Active</p>
                    <p className="text-xs text-gray-500">System</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">24/7</p>
                    <p className="text-xs text-gray-500">Uptime</p>
                  </div>
                </div>
              </div>
            )}

            
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            {!collapsed ? (
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-semibold">
                  AU
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                  <p className="text-xs text-gray-500 truncate">System Administrator</p>
                </div>
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-semibold mx-auto">
                AU
              </div>
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
    </>
  )
}

function AdminLink({ to, label, icon: Icon, collapsed, isActive, isReturn = false }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center p-3 rounded-lg transition-all duration-200 group relative ${
        isActive 
          ? 'bg-gray-100 text-gray-900' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      } ${collapsed ? 'justify-center px-3' : 'px-4'} ${isReturn ? 'mt-4 bg-blue-50 hover:bg-blue-100 text-blue-700' : ''}`}
    >
      <div className={`${isReturn ? 'text-blue-600' : isActive ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'} ${collapsed ? '' : 'mr-3'}`}>
        <Icon className="w-5 h-5" />
      </div>
      
      {!collapsed && (
        <>
          <span className="font-medium text-sm flex-1">{label}</span>
        </>
      )}
      
      {/* Tooltip for collapsed state */}
      {collapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-[100px]">
          {label}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-0 h-0 border-t-4 border-b-4 border-l-0 border-r-4 border-r-gray-900 border-t-transparent border-b-transparent border-l-transparent"></div>
        </div>
      )}
    </Link>
  )
}

export default AdminSidebar