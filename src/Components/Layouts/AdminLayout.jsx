import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import AdminSidebar from '../../Components/Admin/AdminSidebar'
import AdminNav from '../../Components/Admin/AdminNav'

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const mainMarginClass = collapsed ? 'md:ml-20' : 'md:ml-72'

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
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar 
        collapsed={collapsed} 
        mobileOpen={mobileOpen} 
        onToggleCollapse={() => setCollapsed(c => !c)} 
        onClose={() => setMobileOpen(false)} 
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainMarginClass}`}>
        <AdminNav collapsed={collapsed} onToggleSidebar={() => setMobileOpen(s => !s)} />

        <main className="pt-20 p-4 md:p-6">
          <div className="max-w-7xl mx-auto mt-[80px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout