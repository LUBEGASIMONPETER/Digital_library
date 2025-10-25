import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './Components/Layouts/MainLayout'
import AuthLayout from './Components/Layouts/AuthLayout'
import Home from './Pages/Home'
import Signup_page from './Pages/Signup_page'
import Login_page from './Pages/Login_page'
import ForgotPassword from './Pages/ForgotPassword'
import UserAgreement from './Pages/UserAgreement'
import Contact from './Pages/Contact'
import DashboardLayout from './Components/Layouts/DashboardLayout'
import AdminLayout from './Components/Layouts/AdminLayout'
import AdminHome from './Pages/AdminHome'
import DashboardHome from './Pages/DashboardHome'
import DashboardOverview from './Pages/DashboardOverview'
import DashboardLibrary from './Pages/DashboardLibrary'
import DashboardBorrowed from './Pages/DashboardBorrowed'
import DashboardSettings from './Pages/DashboardSettings'
import DashboardAnalytics from './Pages/DashboardAnalytics'
import DashboardSupport from './Pages/DashboardSupport'
import NotFound from './Pages/NotFound'

function App() {
  return (
    <Routes>
      {/* Public site routes using MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="contact" element={<Contact />} />
        {/* User agreement should use MainLayout */}
        <Route path="auth/agreement" element={<UserAgreement />} />
      </Route>

      {/* Auth routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="signup" element={<Signup_page />} />
            <Route path="login" element={<Login_page />} />
            <Route path="forgot" element={<ForgotPassword />} />
            {/* redirect /auth to signup for now */}
            <Route index element={<Navigate to="signup" replace />} />
          </Route>

      {/* Fallback */}
      
      {/* Dashboard area (example public route for now) */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="library" element={<DashboardLibrary />} />
        <Route path="borrowed" element={<DashboardBorrowed />} />
        <Route path="settings" element={<DashboardSettings />} />
        <Route path="support" element={<DashboardSupport />} />
        <Route path="analytics" element={<DashboardAnalytics />} />
      </Route>

      {/* Admin area (protected in a real app) */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHome />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
