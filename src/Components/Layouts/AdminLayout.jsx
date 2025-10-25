import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../../Components/Admin/AdminSidebar'
import AdminNav from '../../Components/Admin/AdminNav'

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const mainMarginClass = collapsed ? 'md:ml-16' : 'md:ml-72'

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar collapsed={collapsed} mobileOpen={mobileOpen} onToggleCollapse={() => setCollapsed(c => !c)} onClose={() => setMobileOpen(false)} />

      <div className={`flex-1 flex flex-col transition-all duration-200 ${mainMarginClass}`}>
        <AdminNav onToggleSidebar={() => setMobileOpen(s => !s)} />

        <main className="pt-[68px] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
