import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../NavBar'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="flex items-center justify-center py-16">
        <div className="w-full mt-8 max-w-md p-6 bg-white rounded-lg shadow">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
