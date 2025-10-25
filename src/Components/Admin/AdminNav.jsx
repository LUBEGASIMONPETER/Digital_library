import React from 'react'
import { Link } from 'react-router-dom'

const AdminNav = ({ onToggleSidebar }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between gap-2 shadow-sm">
      <div className="flex items-center space-x-3">
        <button onClick={onToggleSidebar} className="md:hidden p-2 rounded-lg hover:bg-gray-100">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
      </div>

      <div className="flex items-center space-x-3">
        <Link to="/admin/settings" className="text-sm text-gray-600 hover:text-gray-800">Settings</Link>
        <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">A</div>
      </div>
    </div>
  )
}

export default AdminNav
