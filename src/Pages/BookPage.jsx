import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../Components/Notifications/ToastProvider'
import { useAchievementPopup } from '../Components/Notifications/AchievementPopup'

const BookPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { add: addToast } = useToast()
  const { showMultipleAchievements } = useAchievementPopup()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
        // Use protected books API endpoint (requires authentication)
        const res = await apiFetch(`/api/books/${id}`)
        if (!res.ok) {
          console.error('Failed to fetch book', res.status)
          if (mounted) setBook(null)
          return
        }
        const body = await res.json()
        if (mounted) setBook(body.book || null)
      } catch (err) {
        console.error('Error fetching book', err)
        if (mounted) setBook(null)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center min-h-48">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading book...</p>
      </div>
    </div>
  )

  if (!book) return (
    <div className="p-6 bg-white rounded-2xl shadow-sm text-center">
      <h3 className="text-lg font-semibold">Book not found</h3>
      <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Go back</button>
    </div>
  )

  const handleRead = async () => {
    if (book.fileUrl) {
      window.open(book.fileUrl, '_blank', 'noopener')
      // Implicitly log a small reading activity
      try {
        const res = await apiFetch('/api/users/log-activity', {
          method: 'POST',
          body: JSON.stringify({
            bookId: book._id,
            durationMinutes: 5,
            pagesRead: 2,
            type: 'read'
          })
        })
        if (res.ok) {
          const data = await res.json()
          if (data.newAchievements && data.newAchievements.length > 0) {
            showMultipleAchievements(data.newAchievements)
          }
        }
      } catch (err) {
        console.error('Failed to log auto-activity', err)
      }
    } else {
      alert('No readable file available')
    }
  }

  const [showLogModal, setShowLogModal] = useState(false)
  const [logData, setLogData] = useState({ minutes: '', pages: '' })

  const handleLogActivity = async (e) => {
    e.preventDefault()
    try {
      const res = await apiFetch('/api/users/log-activity', {
        method: 'POST',
        body: JSON.stringify({
          bookId: book._id,
          durationMinutes: parseInt(logData.minutes) || 0,
          pagesRead: parseInt(logData.pages) || 0,
          type: 'read'
        })
      })
      if (res.ok) {
        const data = await res.json()
        addToast({ message: 'Activity logged successfully!', type: 'success' })
        setShowLogModal(false)
        setLogData({ minutes: '', pages: '' })
        
        // Show achievement popup if any were unlocked
        if (data.newAchievements && data.newAchievements.length > 0) {
          showMultipleAchievements(data.newAchievements)
        }
      }
    } catch (err) {
      addToast({ message: 'Failed to log activity', type: 'error' })
    }
  }

  const handleDownload = async () => {
    if (!book.fileUrl) { alert('No file to download'); return }
    try {
      const res = await fetch(book.fileUrl)
      if (!res.ok) throw new Error('Failed to fetch file')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const inferred = (book.fileUrl.split('/').pop() || `${book.title || 'book'}.pdf`).split('?')[0]
      a.download = inferred
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed', err)
      alert('Download failed')
    }
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/3">
          <div className="w-full h-80 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">No cover</div>
            )}
          </div>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex gap-3">
              <button onClick={handleRead} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Read Now</button>
              <button onClick={handleDownload} className="px-4 py-2 bg-gray-100 rounded-lg">Download</button>
            </div>
            <button 
              onClick={() => setShowLogModal(true)}
              className="w-full px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Log Reading Session
            </button>
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
          <p className="text-lg text-gray-600 mb-6">
            {book.resourceType === 'past_paper' ? 'Examiner: ' : 'by '}
            {book.author}
          </p>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-gray-50 px-4 py-2 rounded-xl">
              <span className="block text-xs text-gray-500 uppercase font-semibold">Category</span>
              <span className="text-gray-900">{book.category}</span>
            </div>
            {book.resourceType === 'past_paper' && (
              <>
                <div className="bg-gray-50 px-4 py-2 rounded-xl">
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Exam Year</span>
                  <span className="text-gray-900">{book.examYear}</span>
                </div>
                <div className="bg-gray-50 px-4 py-2 rounded-xl">
                  <span className="block text-xs text-gray-500 uppercase font-semibold">Exam Board</span>
                  <span className="text-gray-900">{book.examBoard}</span>
                </div>
              </>
            )}
            {book.resourceType !== 'past_paper' && book.publishedYear && (
              <div className="bg-gray-50 px-4 py-2 rounded-xl">
                <span className="block text-xs text-gray-500 uppercase font-semibold">Published</span>
                <span className="text-gray-900">{book.publishedYear}</span>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{book.description || 'No description available.'}</p>
          </div>
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Log Progress</h2>
            <form onSubmit={handleLogActivity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Minutes Studied</label>
                <input 
                  type="number" 
                  required
                  value={logData.minutes}
                  onChange={e => setLogData({...logData, minutes: e.target.value})}
                  className="mt-1 block w-full border rounded-lg p-2"
                  placeholder="e.g. 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Pages Read</label>
                <input 
                  type="number" 
                  required
                  value={logData.pages}
                  onChange={e => setLogData({...logData, pages: e.target.value})}
                  className="mt-1 block w-full border rounded-lg p-2"
                  placeholder="e.g. 10"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookPage
