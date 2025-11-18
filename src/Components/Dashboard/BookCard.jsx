import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BookCard = ({ book }) => {
  const [starred, setStarred] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const navigate = useNavigate()

  const handleStarClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setStarred(s => !s)
  }

  const handleBorrowClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Borrow logic would go here
    console.log('Borrowing book:', book.title)
  }

  const handleReadNow = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (book.fileUrl) {
      // open in a new tab for reading
      window.open(book.fileUrl, '_blank', 'noopener')
    } else {
      alert('No readable file is available for this book.')
    }
  }

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!book.fileUrl) {
      alert('No downloadable file is available for this book.')
      return
    }

    try {
      setDownloading(true)
      // fetch the file as a blob and trigger a download to avoid CORS issues with download attribute
      const res = await fetch(book.fileUrl)
      if (!res.ok) throw new Error('Failed to fetch file')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // try to infer filename from URL, fallback to title
      const inferred = (book.fileUrl.split('/').pop() || `${book.title || 'book'}.pdf`).split('?')[0]
      a.download = inferred
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
      alert('Download failed. Please try again or open the file to read instead.')
    } finally {
      setDownloading(false)
    }
  }

  const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' viewBox='0 0 200 250'%3E%3Crect width='200' height='250' fill='%23f3f4f6'/%3E%3Cpath d='M50 80 L150 80 L150 200 L50 200 Z' fill='%23d1d5db'/%3E%3Cpath d='M60 90 L140 90 L140 190 L60 190 Z' fill='%23e5e7eb'/%3E%3Cpath d='M70 100 L130 100 L130 180 L70 180 Z' fill='%23f9fafb'/%3E%3Ctext x='100' y='230' text-anchor='middle' font-family='Arial' font-size='14' fill='%236b7280'%3EBook Cover%3C/text%3E%3C/svg%3E"

  return (
    <div onClick={() => navigate(`/dashboard/books/${book.id}`)} className="cursor-pointer group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:scale-[1.02] transform">
      {/* Book Image */}
      <div className="relative overflow-hidden">
        <div className="w-full h-48 bg-gray-200 relative">
          {!imageError ? (
            <img 
              src={book.image || defaultImage} 
              alt={book.title}
              className={`w-full h-48 object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mb-2 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 6.75C3 5.50736 4.00736 4.5 5.25 4.5H18.75C19.9926 4.5 21 5.50736 21 6.75V17.25C21 18.4926 19.9926 19.5 18.75 19.5H5.25C4.00736 19.5 3 18.4926 3 17.25V6.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 4.5V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-gray-500 text-sm">No cover available</p>
              </div>
            </div>
          )}
          
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse"></div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
          
          {/* Quick actions overlay */}
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handleStarClick}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
                starred 
                  ? 'bg-yellow-500 text-white shadow-lg' 
                  : 'bg-white bg-opacity-90 text-gray-600 hover:bg-white'
              }`}
              aria-label={starred ? "Remove from favorites" : "Add to favorites"}
            >
              {starred ? (
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.966a1 1 0 00.95.69h4.18c.969 0 1.371 1.24.588 1.81l-3.39 2.46a1 1 0 00-.364 1.118l1.287 3.966c.3.921-.755 1.688-1.54 1.118l-3.39-2.46a1 1 0 00-1.176 0l-3.39 2.46c-.785.57-1.84-.197-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.045 9.393c-.783-.57-.38-1.81.588-1.81h4.18a1 1 0 00.95-.69L9.05 2.927z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Category badge */}
          {book.category && (
            <div className="absolute top-3 left-3">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm bg-opacity-90">
                {book.category}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Book Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Title and Author */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
            by {book.author || 'Unknown Author'}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {book.description || 'No description available for this book.'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M17 21v-2a4 4 0 00-3-3.87" />
                <path d="M7 21v-2a4 4 0 013-3.87" />
                <path d="M12 7a4 4 0 100-8 4 4 0 000 8z" transform="translate(0,8)" />
              </svg>
              <span>{book.readers?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>{book.downloads?.toLocaleString() || 0}</span>
            </div>
            {book.rating && (
              <div className="flex items-center space-x-1">
                <span className="text-yellow-500">⭐</span>
                <span>{book.rating}</span>
              </div>
            )}
          </div>
          
          {book.pages && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
              {book.pages} pages
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-3">
          <button 
            onClick={handleReadNow}
            className={`flex-1 ${book.fileUrl ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'} py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center justify-center space-x-2`}
            disabled={!book.fileUrl}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 7h16v13H2z" />
              <path d="M6 3v4" />
              <path d="M10 3v4" />
            </svg>
            <span>Read Now</span>
          </button>

          {/* Download button: use anchor when file exists so browser handles download */}
          {book.fileUrl ? (
            <a href={book.fileUrl} download className="w-12 h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group" onClick={handleDownload} aria-label="Download book">
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          ) : (
            <button className="w-12 h-12 border-2 border-gray-200 rounded-xl flex items-center justify-center text-gray-300 bg-gray-50 cursor-not-allowed" aria-label="No download available" disabled>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          )}
        </div>

        {/* Additional Info */}
        {(book.subject || book.level) && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {book.subject && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  {book.subject}
                </span>
              )}
              {book.level && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {book.level}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default BookCard