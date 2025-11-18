// AdminLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../../Components/Admin/AdminSidebar'
import AdminNav from '../../Components/Admin/AdminNav'

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const mainMarginClass = collapsed ? 'md:ml-20' : 'md:ml-80'

  // Close mobile sidebar when route changes
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && mobileOpen) {
        setMobileOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileOpen])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50/30">
      <AdminSidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        onToggleCollapse={() => setCollapsed(c => !c)} 
        onClose={() => setMobileOpen(false)} 
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainMarginClass}`}>
        <AdminNav onToggleSidebar={() => setMobileOpen(s => !s)} />

        <main className="pt-20 p-6 md:p-8">
          <div className="max-w-7xl mt-16 mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout;