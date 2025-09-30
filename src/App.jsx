import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import hero_bg from "../public/Hero_bg.jpg";
import NavBar from "./Components/NavBar";
import Footer from "./Components/Footer";
import "./App.css";

function App() {
  return (
    <div className="font-sans bg-gray-50">
      <NavBar />

      {/* Hero Section */}
      <section
        id="home"
        className="pt-32 pb-20 bg-gradient-to-r from-blue-500 to-blue-700 text-white"
      >
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Unlock a World of Knowledge, Anywhere, Anytime
            </h1>
            <p className="text-xl mb-8">
              Access a variety of eBooks, research papers, and academic
              resources with our digital library platform. Learn, explore, and
              grow—at your own pace.
            </p>
            <div className="flex space-x-4">
              <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-semibold">
                Browse Library
              </button>
              <button className="bg-transparent border-2 border-white hover:bg-blue-600 px-6 py-3 rounded-md font-semibold">
                Join for Free
              </button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              className="rounded-xl shadow-lg"
              src={hero_bg} // Make sure this is a relevant image: books, laptop, library, etc.
              alt="Digital Library Access"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Our Digital Library?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-database text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Vast Digital Collection
              </h3>
              <p className="text-gray-600">
                Access millions of e-books, academic journals, and research
                papers across all disciplines, available 24/7.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Smart Search & Discovery
              </h3>
              <p className="text-gray-600">
                Our intelligent search engine and AI-powered recommendations
                help you find relevant resources instantly.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-user-check text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Personalized Experience
              </h3>
              <p className="text-gray-600">
                Create reading lists, save your progress, and get tailored
                content suggestions based on your interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Join Our Learning Community?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Register now to access our vast digital resources and connect with
            fellow readers and researchers.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-semibold">
              Apply Now
            </button>
            <button className="bg-transparent border-2 border-white hover:bg-blue-700 px-6 py-3 rounded-md font-semibold">
              Contact Us
            </button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default App;
