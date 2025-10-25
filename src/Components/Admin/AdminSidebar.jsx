import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const AdminSidebar = ({ collapsed = false, mobileOpen = false, onToggleCollapse = () => {}, onClose = () => {} }) => {
  const location = useLocation()
  const desktopWidthClass = collapsed ? 'md:w-20' : 'md:w-72'
  const mobileTransformClass = mobileOpen ? 'translate-x-0' : '-translate-x-full'

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-gray-200 transform transition-all duration-300 ${mobileTransformClass} md:translate-x-0 ${desktopWidthClass}`}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white font-bold">AD</div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Admin</h2>
                <p className="text-sm text-gray-500">Control Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg text-white font-bold mx-auto">AD</div>
          )}

          <div className="flex items-center space-x-2">
            <button onClick={onToggleCollapse} className="hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100" aria-label="Toggle sidebar">
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M15 18L9 12L15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={onClose} className="md:hidden w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center" aria-label="Close sidebar">
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <AdminLink to="/admin" label="Overview" icon="📊" collapsed={collapsed} isActive={location.pathname === '/admin'} />
          <AdminLink to="/admin/users" label="Users" icon="👥" collapsed={collapsed} isActive={location.pathname.includes('/admin/users')} />
          <AdminLink to="/admin/books" label="Books" icon="📚" collapsed={collapsed} isActive={location.pathname.includes('/admin/books')} />
          <AdminLink to="/admin/reports" label="Reports" icon="📈" collapsed={collapsed} isActive={location.pathname.includes('/admin/reports')} />
          <AdminLink to="/admin/settings" label="Settings" icon="⚙️" collapsed={collapsed} isActive={location.pathname.includes('/admin/settings')} />
          <div className={`h-px bg-gray-200 my-4 ${collapsed ? 'mx-2' : 'mx-4'}`}></div>
          <AdminLink to="/dashboard" label="Return to Dashboard" icon="↩️" collapsed={collapsed} isActive={location.pathname.includes('/dashboard')} />
        </nav>

        <div className="p-4 border-t border-gray-200">
          {!collapsed ? (
            <div className="text-sm text-gray-500">© {new Date().getFullYear()} Kawempe Library</div>
          ) : (
            <div className="text-xs text-gray-400 text-center">©{new Date().getFullYear()}</div>
          )}
        </div>
      </div>
    </aside>
  )
}

function AdminLink({ to, label, icon, collapsed, isActive }) {
  return (
    <Link to={to} className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm' : 'text-gray-600 hover:bg-gray-50' } ${collapsed ? 'justify-center' : ''}`}>
      <div className={`text-lg ${collapsed ? '' : 'mr-3'}`}>{icon}</div>
      {!collapsed && <span className="font-medium flex-1">{label}</span>}
    </Link>
  )
}

export default AdminSidebar
