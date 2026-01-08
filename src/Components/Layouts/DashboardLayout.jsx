import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Dashboard/Sidebar'
import DashboardNav from '../Dashboard/DashboardNav'

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const mainMarginClass = collapsed ? 'md:ml-20' : 'md:ml-72'
  const mainPaddingLeftClass = collapsed ? 'md:pl-4' : 'md:pl-6'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed(v => !v)}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${mainMarginClass} ${mainPaddingLeftClass}`}>
        <DashboardNav 
          collapsed={collapsed} 
          onToggleSidebar={() => setMobileOpen(v => !v)} 
        />

        <main className="pt-20 p-4 md:p-6">
          <div className="max-w-7xl mx-auto mt-[10px] md:mt-[80px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout