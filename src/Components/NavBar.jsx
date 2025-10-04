import React, { useState } from "react";
import APP_LOGO from "../../public/APP_LOGO.png";
import { Link, useLocation } from "react-router-dom";

const NavBar = () => {
  const location = useLocation()
  const onSignup = location.pathname === '/auth/signup'
  const onLogin = location.pathname === '/auth/login'
  const onHome = location.pathname === '/'
  const onAgreement = location.pathname === '/auth/agreement'
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div>
      {/* Header/Navigation */}
      <header className="bg-white shadow-md fixed w-full z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <div className="">
              <img className="h-8 mr-2" src={APP_LOGO} alt="APP_logo" />
            </div>
            <span className="text-xl font-bold text-blue-800">Library</span>
          </Link>

          {/* Desktop nav links (hidden on small) */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
            <Link to="/#about" className="text-gray-700 hover:text-blue-600">About</Link>
            <Link to="/contact" className="text-gray-700 hover:text-blue-600">Contact</Link>
          </nav>

          

          {/* If we're on the agreement page we don't show auth buttons; on small screens show a hamburger to open a right-side menu */}
          {onAgreement ? (
            <>
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                aria-label="Open menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Right-side sliding menu */}
              <div
                className={
                  `fixed inset-y-0 right-0 w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`
                }
                role="dialog"
                aria-modal="true"
              >
                <div className="p-4 flex justify-between items-center border-b">
                  <div className="flex items-center">
                    <img className="h-6 mr-2" src={APP_LOGO} alt="APP_logo" />
                    <span className="font-bold text-blue-800">Library</span>
                  </div>
                  <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <Link to="/" className="block text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Home</Link>
                  <Link to="/#about" className="block text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>About</Link>
                  <Link to="/contact" className="block text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>Contact</Link>
                </div>
              </div>

              {/* Backdrop when menu is open */}
              {menuOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setMenuOpen(false)} />
              )}
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-3">
              {onHome ? (
                <>
                  <Link to="/auth/login" className="bg-transparent text-blue-700 border border-blue-700 px-3 py-2 rounded-md">Login</Link>
                  <Link to="/auth/signup" className="hidden sm:inline-block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md">Join Us</Link>
                </>
              ) : onLogin ? (
                <Link to="/auth/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Sign up</Link>
              ) : (
                <Link to="/auth/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">Login</Link>
              )}
        </div>
          )}

            {/* Mobile hamburger for general pages (placed as last item on the right) */}
            {!onAgreement && (
              <div className="md:hidden ml-2 flex items-center">
                {/* compact auth button shown on small screens next to hamburger */}
                <div className="mr-2">
                  {onHome ? (
                    <Link to="/auth/signup" className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Join</Link>
                  ) : onLogin ? (
                    <Link to="/auth/signup" className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Sign up</Link>
                  ) : onSignup ? (
                    <Link to="/auth/login" className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Login</Link>
                  ) : (
                    <Link to="/auth/login" className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm">Login</Link>
                  )}
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-700 hover:bg-gray-100" aria-label="Open mobile menu">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {mobileMenuOpen && (
                  <div className="absolute top-full right-4 mt-2 w-48 bg-white rounded-lg shadow-lg z-50">
                    <div className="p-2 flex flex-col">
                      <Link to="/" className="p-2 rounded hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                      <Link to="/#about" className="p-2 rounded hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>About</Link>
                      <Link to="/contact" className="p-2 rounded hover:bg-gray-50" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>
      </header>
    </div>
  );
};

export default NavBar;
