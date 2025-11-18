import React, { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { useParams, useNavigate } from 'react-router-dom'

const BookPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
  const res = await apiFetch(`/api/admin/books/${id}`)
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

  const handleRead = () => {
    if (book.fileUrl) window.open(book.fileUrl, '_blank', 'noopener')
    else alert('No readable file available')
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
          <div className="mt-4 flex gap-3">
            <button onClick={handleRead} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Read Now</button>
            <button onClick={handleDownload} className="px-4 py-2 bg-gray-100 rounded-lg">Download</button>
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{book.title}</h1>
          <p className="text-gray-600 mt-1">by {book.author}</p>
          <div className="mt-4 text-sm text-gray-700">
            <p className="mb-2"><strong>Category:</strong> {book.category || '—'}</p>
            <p className="mb-2"><strong>Publisher:</strong> {book.publisher || '—'}</p>
            <p className="mb-2"><strong>Published Year:</strong> {book.publishedYear || '—'}</p>
            <p className="mb-2"><strong>ISBN:</strong> {book.isbn || '—'}</p>
            <p className="mb-2"><strong>Copies:</strong> {book.availableCopies}/{book.totalCopies}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-line">{book.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookPage
