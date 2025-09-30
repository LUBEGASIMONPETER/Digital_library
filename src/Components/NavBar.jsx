import React from "react";
import APP_LOGO from "../../public/APP_LOGO.png";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <div>
      {/* Header/Navigation */}
      <header className="bg-white shadow-md fixed w-full z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="">
              <img className="h-8 mr-2" src={APP_LOGO} alt="APP_logo" />
            </div>
            <span className="text-xl font-bold text-blue-800">Library</span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600">
              Home
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600">
              Contact
            </a>
          </nav>

          <Link
            to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
            Join Us
          </Link>
        </div>
      </header>
    </div>
  );
};

export default NavBar;
