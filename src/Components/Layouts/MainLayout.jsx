import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../NavBar'
import Footer from '../Footer'

const MainLayout = () => {
  return (
    <div className="font-sans bg-gray-50 min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default MainLayout
