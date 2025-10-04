import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Dashboard/Sidebar'
import DashboardNav from '../Dashboard/DashboardNav'

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // when sidebar is fixed, main content should have left margin to avoid overlap on md+
  const mainMarginClass = collapsed ? 'md:ml-16' : 'md:ml-64'
  const mainPaddingLeftClass = collapsed ? 'md:pl-4' : 'md:pl-8'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (fixed) */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(v => !v)}
        onClose={() => setMobileOpen(false)}
      />

      <div className={`flex-1 flex flex-col transition-all duration-200 ${mainMarginClass} ${mainPaddingLeftClass}`}>
        <DashboardNav collapsed={collapsed} onToggleSidebar={() => setMobileOpen(v => !v)} />

        {/* add top padding equal to nav height so content is not hidden under fixed nav */}
        <main className="pt-[90px] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
