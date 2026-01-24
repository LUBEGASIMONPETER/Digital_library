import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../../lib/api'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../Notifications/ToastProvider'
import { useAchievementPopup } from '../Notifications/AchievementPopup'

const BookCard = ({ book }) => {
  const { user, setUser } = useAuth()
  const { add: addToast } = useToast()
  const { showMultipleAchievements } = useAchievementPopup()
  const [starred, setStarred] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (user && user.favorites) {
      setStarred(user.favorites.includes(book.id))
    }
  }, [user, book.id])

  const handleStarClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    const oldStarred = starred
    setStarred(!oldStarred)
    
    try {
      const res = await apiFetch(`/api/users/favorite/${book.id}`, { method: 'POST' })
      if (!res.ok) {
        setStarred(oldStarred)
        addToast({ message: 'Failed to update favorite', type: 'error' })
      } else {
        const data = await res.json()
        if (setUser && user) {
          const newFavorites = !oldStarred 
            ? [...(user.favorites || []), book.id]
            : (user.favorites || []).filter(id => id !== book.id)
          setUser({ ...user, favorites: newFavorites })
        }
        addToast({ 
          message: !oldStarred ? 'Added to favorites' : 'Removed from favorites', 
          type: 'success' 
        })
        // Show achievement popup if any were unlocked
        if (data.newAchievements && data.newAchievements.length > 0) {
          showMultipleAchievements(data.newAchievements)
        }
      }
    } catch (err) {
      setStarred(oldStarred)
      addToast({ message: 'Network error', type: 'error' })
    }
  }

  const handleReadNow = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      addToast({ message: 'Please sign in to read books', type: 'error' })
      navigate('/auth/login')
      return
    }

    if (book.fileUrl) {
      // open in a new tab for reading
      window.open(book.fileUrl, '_blank', 'noopener')
    } else {
      addToast({ message: 'No readable file is available for this book.', type: 'info' })
    }
  }

  const handleDownload = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      addToast({ message: 'Please sign in to download books', type: 'error' })
      navigate('/auth/login')
      return
    }

    if (!book.fileUrl) {
      addToast({ message: 'No downloadable file is available for this book.', type: 'info' })
      return
    }

    try {
      setDownloading(true)
      addToast({ message: 'Preparing download...', type: 'info' })
      
      // Use apiFetch to ensure proper authentication and CORS handling
      const res = await apiFetch(book.fileUrl, {
        method: 'GET',
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch file: ${res.status} ${res.statusText}`)
      }
      
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Extract filename from URL or use book title
      const filename = book.fileUrl.split('/').pop().split('?')[0] || `${book.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      a.download = filename
      
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      
      addToast({ message: 'Download started!', type: 'success' })

      // Record download in backend
      try {
        const dRes = await apiFetch(`/api/users/download/${book.id}`, { method: 'POST' })
        if (dRes.ok) {
          const dData = await dRes.json()
          if (setUser && user) {
            if (!(user.downloads || []).includes(book.id)) {
               setUser({ ...user, downloads: [...(user.downloads || []), book.id] })
            }
          }
          // Show achievement popup if any were unlocked
          if (dData.newAchievements && dData.newAchievements.length > 0) {
            showMultipleAchievements(dData.newAchievements)
          }
        }
      } catch (e) {
        console.error('Failed to record download:', e)
      }
    } catch (err) {
      console.error('Download failed', err)
      addToast({ message: `Download failed: ${err.message}`, type: 'error' })
    } finally {
      setDownloading(false)
    }
  }

  const defaultImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='250' viewBox='0 0 200 250'%3E%3Crect width='200' height='250' fill='%23f8fafc'/%3E%3Cpath d='M50 80 L150 80 L150 200 L50 200 Z' fill='%23e2e8f0'/%3E%3Cpath d='M60 90 L140 90 L140 190 L60 190 Z' fill='%23f1f5f9'/%3E%3Cpath d='M70 100 L130 100 L130 180 L70 180 Z' fill='%23ffffff'/%3E%3C/svg%3E"

  // Use coverUrl (from API) or image (legacy) or default
  const coverImage = book.coverUrl || book.image || defaultImage

  return (
    <div 
      onClick={() => navigate(`/dashboard/books/${book.id}`)} 
      className="cursor-pointer group bg-white rounded-xl hover:shadow-xl transition-all duration-300 border border-slate-100 overflow-hidden hover:scale-[1.02] transform hover:border-blue-100"
    >
      {/* Book Image */}
      <div className="relative overflow-hidden">
        <div className="w-full h-48 bg-gradient-to-br from-slate-50 to-slate-100 relative">
          {!imageError ? (
            <img 
              src={coverImage} 
              alt={book.title}
              className={`w-full h-48 object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-slate-300 mb-2 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 6.75C3 5.50736 4.00736 4.5 5.25 4.5H18.75C19.9926 4.5 21 5.50736 21 6.75V17.25C21 18.4926 19.9926 19.5 18.75 19.5H5.25C4.00736 19.5 3 18.4926 3 17.25V6.75Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7.5 4.5V19.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-slate-400 text-sm">No cover available</p>
              </div>
            </div>
          )}
          
          {/* Loading skeleton */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse"></div>
          )}
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
          
          {/* Quick actions overlay */}
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
              onClick={handleStarClick}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
                starred 
                  ? 'bg-yellow-500 text-white shadow-lg hover:bg-yellow-600' 
                  : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 shadow-sm'
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
              <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm bg-opacity-90 font-medium">
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
          <h3 className="font-semibold text-[15px] md:text-lg text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-[11px] md:text-sm text-slate-600 mt-1 line-clamp-1">
            {book.resourceType === 'past_paper' ? 'by Examiner: ' : 'by '}
            {book.author || (book.resourceType === 'past_paper' ? 'Unknown Examiner' : 'Unknown Author')}
          </p>
        </div>

        {/* Description */}
        <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
          {book.description || 'No description available for this book.'}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span className="text-xs md:text-sm">{book.downloads?.toLocaleString() || 0} Downloads</span>
            </div>
          </div>
          
          {book.pages && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
              {book.pages} pages
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between space-x-3">
          <button 
            onClick={handleReadNow}
            className={`flex-1 ${
              book.fileUrl 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            } py-2.5 md:py-3 md:px-4 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-sm hover:shadow-md flex items-center justify-center space-x-2`}
            disabled={!book.fileUrl}
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <span className='text-xs md:text-[14px]'>Read Now</span>
          </button>

          {/* Download button */}
          {book.fileUrl ? (
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-12 h-12 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 bg-white hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={downloading ? "Downloading..." : "Download book"}
            >
              {downloading ? (
                <svg className="w-4 h-4 animate-spin text-blue-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              )}
            </button>
          ) : (
            <button 
              className="w-12 h-12 border border-slate-100 rounded-lg flex items-center justify-center text-slate-300 bg-slate-50 cursor-not-allowed" 
              aria-label="No download available" 
              disabled
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          )}
        </div>

        {/* Additional Info */}
        {(book.subject || book.level) && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex flex-wrap gap-1.5">
              {book.subject && (
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                  {book.subject}
                </span>
              )}
              {book.level && (
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
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