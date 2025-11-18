import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'

// Ugandan A-Level subjects commonly used as categories (module-level so modals/components can access)
const A_LEVEL_SUBJECTS = [
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Economics', 'History', 'Geography', 'Literature in English', 'Computer Studies', 'Agriculture', 'Entrepreneurship', 'Fine Art', 'Commerce', 'French', 'Christian Religious Education'
]

const BookCatalog = () => {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooks, setSelectedBooks] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [booksPerPage] = useState(12)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [bookToDelete, setBookToDelete] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    totalCopies: 1,
    availableCopies: 1,
    publisher: '',
    publishedYear: new Date().getFullYear(),
    coverUrl: '',
    coverFile: null,
    bookFile: null,
    fileUrl: ''
  })

  // local preview URL for coverFile to revoke when changed
  const [coverPreview, setCoverPreview] = useState('')

  // edit modal state
  const [showEditModal, setShowEditModal] = useState(false)
  const [bookToEdit, setBookToEdit] = useState(null)

  

  // fetch books from backend
  const fetchBooks = async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/admin/books')
      if (!res.ok) {
        console.error('Failed to fetch books', res.status)
        setBooks([])
        setFilteredBooks([])
        setLoading(false)
        return
      }
      const body = await res.json()
      const serverBooks = Array.isArray(body.books) ? body.books : []
      // map server book shape to UI-friendly shape
      const mapped = serverBooks.map(b => ({
        id: b._id || b.id,
        title: b.title,
        author: b.author,
        isbn: b.isbn || '',
        category: b.category,
        status: b.status || 'available',
        totalCopies: b.totalCopies || 1,
        availableCopies: b.availableCopies || b.totalCopies || 1,
        publisher: b.publisher || '',
        publishedYear: b.publishedYear || '',
        description: b.description || '',
        coverUrl: b.coverUrl || b.cover || '',
        fileUrl: b.fileUrl || '',
        addedDate: b.addedDate || b.createdAt || '',
        borrowCount: b.borrowCount || 0
      }))
      setBooks(mapped)
      setFilteredBooks(mapped)
    } catch (error) {
      console.error('Error fetching books:', error)
      setBooks([])
      setFilteredBooks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  // revoke object URL when coverFile or modal closes to avoid memory leak
  useEffect(() => {
    return () => {
      if (coverPreview) {
        try { URL.revokeObjectURL(coverPreview) } catch (e) {}
      }
    }
  }, [coverPreview])

  // Filter books based on search and filters
  useEffect(() => {
    let filtered = books

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(book => book.category === categoryFilter)
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(book => book.status === statusFilter)
    }

    setFilteredBooks(filtered)
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, books])

  // Get unique categories for filter - include A-level subjects first
  const categories = ['all', ...new Set([
    ...A_LEVEL_SUBJECTS,
    ...books.map(book => book.category).filter(Boolean)
  ])]

  // Pagination
  const indexOfLastBook = currentPage * booksPerPage
  const indexOfFirstBook = indexOfLastBook - booksPerPage
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)

  // --- Stats calculations (compare last 30 days vs previous 30 days) ---
  const now = new Date()
  const days = 30
  const ms30 = days * 24 * 60 * 60 * 1000
  const cutoff = new Date(now.getTime() - ms30)
  const cutoffPrev = new Date(now.getTime() - ms30 * 2)

  // helper to safely parse date-like values
  const parseDate = (d) => {
    if (!d) return null
    const parsed = new Date(d)
    return isNaN(parsed.getTime()) ? null : parsed
  }

  // count books added in a period (start exclusive, end inclusive)
  const countAddedInRange = (start, end) => books.filter(b => {
    const ad = parseDate(b.addedDate)
    if (!ad) return false
    return ad > start && ad <= end
  }).length

  const addedLast30 = countAddedInRange(cutoff, now)
  const addedPrev30 = countAddedInRange(cutoffPrev, cutoff)

  const totalBooks = books.length

  // For availability/maintenance/borrowed previous snapshots we approximate by excluding books added in the last 30 days
  const isOld = (b) => {
    const ad = parseDate(b.addedDate)
    // if no addedDate assume it existed previously
    if (!ad) return true
    return ad <= cutoff
  }

  const availableNow = books.filter(b => b.status === 'available').length
  const availablePrev = books.filter(b => isOld(b) && b.status === 'available').length

  const maintenanceNow = books.filter(b => b.status === 'maintenance').length
  const maintenancePrev = books.filter(b => isOld(b) && b.status === 'maintenance').length

  const borrowedNow = books.reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0)
  const borrowedPrev = books.filter(isOld).reduce((sum, book) => sum + (book.totalCopies - book.availableCopies), 0)

  const calcPercent = (prev, curr) => {
    // If no previous data, but current > 0, show 100% growth; if both zero, show 0%
    if (prev === 0) {
      if (curr === 0) return { text: '0%', trend: 'neutral' }
      return { text: '+100%', trend: 'up' }
    }
    const raw = ((curr - prev) / prev) * 100
    const rounded = Math.round(Math.abs(raw))
    const sign = raw > 0 ? '+' : raw < 0 ? '-' : ''
    const trend = raw > 0 ? 'up' : raw < 0 ? 'down' : 'neutral'
    return { text: `${sign}${rounded}%`, trend }
  }

  const totalChange = calcPercent(totalBooks - addedLast30, totalBooks)
  const availableChange = calcPercent(availablePrev, availableNow)
  const borrowedChange = calcPercent(borrowedPrev, borrowedNow)
  const maintenanceChange = calcPercent(maintenancePrev, maintenanceNow)

  // Select all books on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageBookIds = currentBooks.map(book => book.id)
      setSelectedBooks(currentPageBookIds)
    } else {
      setSelectedBooks([])
    }
  }

  // Handle individual book selection
  const handleBookSelect = (bookId) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    )
  }

  // Delete book
  const handleDeleteBook = (book) => {
    setBookToDelete(book)
    setShowDeleteModal(true)
  }

  // Edit book (open modal)
  const handleEditBook = (book) => {
    console.log('handleEditBook called for book id=', book?.id)
    setBookToEdit({ ...book })
    setShowEditModal(true)
    // prefill preview if coverUrl exists
    if (book.coverUrl) setCoverPreview(book.coverUrl)
  }

  const confirmDelete = () => {
    if (!bookToDelete) {
      setShowDeleteModal(false)
      return
    }

    ;(async () => {
      console.log('Deleting book, bookToDelete=', bookToDelete)
      try {
        setLoading(true)
  const res = await apiFetch(`/api/admin/books/${bookToDelete.id}`, { method: 'DELETE' })
        console.log('Delete response status=', res.status)
        setLoading(false)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          console.error('Delete failed response body=', body)
          alert('Failed to delete book: ' + (body.message || res.statusText))
          setShowDeleteModal(false)
          setBookToDelete(null)
          return
        }

        // Remove locally
        setBooks(books.filter(book => book.id !== bookToDelete.id))
        setSelectedBooks(selectedBooks.filter(id => id !== bookToDelete.id))
        setShowDeleteModal(false)
        setBookToDelete(null)
      } catch (err) {
        setLoading(false)
        console.error('Delete book error', err)
        alert('Failed to delete book')
        setShowDeleteModal(false)
        setBookToDelete(null)
      }
    })()
  }

  // Add new book
  const handleAddBook = (e) => {
    e.preventDefault()

    // Submit to backend using multipart/form-data so files are uploaded to Cloudinary
    ;(async () => {
      try {
        const form = new FormData()
        form.append('title', newBook.title)
        form.append('author', newBook.author)
        if (newBook.isbn) form.append('isbn', newBook.isbn)
        form.append('category', newBook.category)
        if (newBook.description) form.append('description', newBook.description)
        form.append('totalCopies', String(newBook.totalCopies))
        form.append('availableCopies', String(newBook.availableCopies))
        if (newBook.publisher) form.append('publisher', newBook.publisher)
        if (newBook.publishedYear) form.append('publishedYear', String(newBook.publishedYear))
        if (newBook.coverUrl) form.append('coverUrl', newBook.coverUrl)
        if (newBook.fileUrl) form.append('fileUrl', newBook.fileUrl)
  if (newBook.coverFile) form.append('cover', newBook.coverFile)
  if (newBook.bookFile) form.append('file', newBook.bookFile)

        // show a quick loading state
        setLoading(true)
        const res = await apiFetch('/api/admin/books', {
          method: 'POST',
          body: form
        })
        setLoading(false)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          alert('Failed to add book: ' + (body.message || res.statusText))
          return
        }
        const body = await res.json()
        if (body && body.book) {
          // refresh list from server to get consistent mapping
          await fetchBooks()
        }
        setShowAddModal(false)
        setNewBook({
          title: '',
          author: '',
          isbn: '',
          category: '',
          description: '',
          totalCopies: 1,
          availableCopies: 1,
          publisher: '',
          publishedYear: new Date().getFullYear(),
          coverUrl: '',
          coverFile: null,
          bookFile: null,
          fileUrl: ''
        })
      } catch (err) {
        setLoading(false)
        console.error('Add book error', err)
        alert('Failed to add book')
      }
    })()
  }

  // Update existing book
  const handleUpdateBook = (e) => {
    e.preventDefault()
    if (!bookToEdit) return

    ;(async () => {
      try {
        const form = new FormData()
        form.append('title', bookToEdit.title)
        form.append('author', bookToEdit.author)
        if (bookToEdit.isbn !== undefined) form.append('isbn', bookToEdit.isbn)
        form.append('category', bookToEdit.category)
        if (bookToEdit.description !== undefined) form.append('description', bookToEdit.description)
        form.append('totalCopies', String(bookToEdit.totalCopies))
        form.append('availableCopies', String(bookToEdit.availableCopies))
        if (bookToEdit.publisher) form.append('publisher', bookToEdit.publisher)
        if (bookToEdit.publishedYear) form.append('publishedYear', String(bookToEdit.publishedYear))
        if (bookToEdit.coverUrl) form.append('coverUrl', bookToEdit.coverUrl)
        if (bookToEdit.fileUrl) form.append('fileUrl', bookToEdit.fileUrl)
        if (bookToEdit.coverFile) form.append('cover', bookToEdit.coverFile)
        if (bookToEdit.bookFile) form.append('file', bookToEdit.bookFile)

        setLoading(true)
        const res = await apiFetch(`/api/admin/books/${bookToEdit.id}`, {
          method: 'PUT',
          body: form
        })
        setLoading(false)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          alert('Failed to update book: ' + (body.message || res.statusText))
          return
        }
        const body = await res.json()
        if (body && body.book) {
          await fetchBooks()
        }
        setShowEditModal(false)
        setBookToEdit(null)
        setCoverPreview('')
      } catch (err) {
        setLoading(false)
        console.error('Update book error', err)
        alert('Failed to update book')
      }
    })()
  }

  // Update book status
  const updateBookStatus = (bookId, newStatus) => {
    setBooks(books.map(book =>
      book.id === bookId ? { ...book, status: newStatus } : book
    ))
  }

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedBooks.length === 0) return
    
    setBooks(books.filter(book => !selectedBooks.includes(book.id)))
    setSelectedBooks([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Catalog</h1>
          <p className="text-gray-600 mt-1">Manage your library's book collection</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {selectedBooks.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Selected ({selectedBooks.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Book
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Books"
          value={totalBooks}
          change={totalChange.text}
          trend={totalChange.trend}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M3 6.5A2.5 2.5 0 015.5 4h13A2.5 2.5 0 0121 6.5v11A2.5 2.5 0 0118.5 20h-13A2.5 2.5 0 013 17.5v-11zM6 6a1 1 0 00-1 1v9.5c0 .276.224.5.5.5H8V6H6zm3 0v12h8.5c.276 0 .5-.224.5-.5V7a1 1 0 00-1-1H9z" />
            </svg>
          }
          color="indigo"
        />
        <StatCard
          title="Available Now"
          value={availableNow}
          change={availableChange.text}
          trend={availableChange.trend}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm-1 14.414l-4.707-4.707 1.414-1.414L11 13.586l6.293-6.293 1.414 1.414L11 16.414z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Currently Borrowed"
          value={borrowedNow}
          change={borrowedChange.text}
          trend={borrowedChange.trend}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M18 2H8a2 2 0 00-2 2v14a2 2 0 002 2h10v-2H8V4h10v6h2V4a2 2 0 00-2-2zM6 8H4v12a2 2 0 002 2h12v-2H6V8z" />
            </svg>
          }
          color="blue"
        />
        <StatCard
          title="Needs Maintenance"
          value={maintenanceNow}
          change={maintenanceChange.text}
          trend={maintenanceChange.trend}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M22 2l-2 2-3 1-1 3 1 3 2 2-5 5-3-3-2 2 3 3-4 4-7-7 4-4 3 3 2-2-3-3 5-5 2-2-2-2 3-1 1-3 3-1 2-2 2 2z" />
            </svg>
          }
          color="orange"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search books by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            >
              <option value="all">All Categories</option>
              {categories.filter(cat => cat !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="maintenance">Maintenance</option>
              <option value="lost">Lost</option>
            </select>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                selected={selectedBooks.includes(book.id)}
                onSelect={handleBookSelect}
                onDelete={handleDeleteBook}
                  onStatusChange={updateBookStatus}
                  onEdit={handleEditBook}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-gray-500 text-lg">No books found</p>
            <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700">
              Showing {indexOfFirstBook + 1} to {Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length} books
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <AddBookModal
          book={newBook}
          onChange={setNewBook}
          onSubmit={handleAddBook}
          onClose={() => setShowAddModal(false)}
          coverPreview={coverPreview}
          setCoverPreview={setCoverPreview}
        />
      )}

      {/* Edit Book Modal */}
      {showEditModal && bookToEdit && (
        <EditBookModal
          book={bookToEdit}
          onChange={setBookToEdit}
          onSubmit={handleUpdateBook}
          onClose={() => { setShowEditModal(false); setBookToEdit(null); setCoverPreview('') }}
          coverPreview={coverPreview}
          setCoverPreview={setCoverPreview}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteModal
          book={bookToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}

// Book Card Component
const BookCard = ({ book, selected, onSelect, onDelete, onStatusChange, onEdit }) => {
  const [showActions, setShowActions] = useState(false)

  const statusColors = {
    available: 'bg-green-100 text-green-800',
    unavailable: 'bg-red-100 text-red-800',
    maintenance: 'bg-orange-100 text-orange-800',
    lost: 'bg-gray-100 text-gray-800'
  }

  const statusIcons = {
    available: '✅',
    unavailable: '❌',
    maintenance: '🔧',
    lost: '🔍'
  }

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-200 ${
      selected ? 'border-indigo-500 shadow-lg' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
    }`}>
      <div className="p-4">
        {/* Book Header */}
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(book.id)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 mt-1"
          />
          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setShowActions(!showActions) }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                <button onClick={(e) => { e.stopPropagation(); console.log('BookCard edit clicked for', book?.id); setShowActions(false); if (typeof onEdit === 'function') onEdit(book); }} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Book
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(book) }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                >
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Book
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Book Cover */}
        <div className="w-full h-48 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-4 flex items-center justify-center">
          {book.coverUrl ? (
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover rounded-xl" />
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-sm text-gray-600">No cover</p>
            </div>
          )}
        </div>

        {/* Book Info */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2" title={book.title}>
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">{book.category}</span>
            <span className="text-xs font-medium text-gray-500">{book.publishedYear}</span>
          </div>

          {/* Status and Copies */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[book.status]}`}>
              {statusIcons[book.status]} {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
            </span>
            <span className="text-sm text-gray-600">
              {book.availableCopies}/{book.totalCopies} available
            </span>
          </div>

          {/* Borrow Count */}
          <div className="mt-2 text-xs text-gray-500">
            Borrowed {book.borrowCount} times
            {book.fileUrl && (
              <div className="mt-2">
                <a href={book.fileUrl} download className="text-indigo-600 text-sm hover:underline">Download PDF</a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value, change, trend, icon, color }) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700'
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border-2 ${colorClasses[color]} p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <p className={`text-sm font-medium mt-1 ${trend === 'up' ? 'opacity-80' : 'opacity-60'}`}>
            {change} from last month
          </p>
        </div>
        <div className="text-3xl opacity-80">{icon}</div>
      </div>
    </div>
  )
}

// Add Book Modal
const AddBookModal = ({ book, onChange, onSubmit, onClose, coverPreview, setCoverPreview }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Add New Book</h3>
        <p className="text-gray-600 mt-1">Enter the details for the new book</p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={book.title}
              onChange={(e) => onChange({...book, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter book title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
            <input
              type="text"
              required
              value={book.author}
              onChange={(e) => onChange({...book, author: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
            <input
              type="text"
              value={book.isbn}
              onChange={(e) => onChange({...book, isbn: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter ISBN"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category (A-Level subject) *</label>
            <select
              required
              value={book.category}
              onChange={(e) => onChange({...book, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select A-Level subject</option>
              {A_LEVEL_SUBJECTS.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Categories are linked to Uganda A-Level subjects for easy curriculum mapping.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
            <input
              type="text"
              value={book.publisher}
              onChange={(e) => onChange({...book, publisher: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter publisher"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Published Year</label>
            <input
              type="number"
              value={book.publishedYear}
              onChange={(e) => onChange({...book, publishedYear: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="1000"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
            <input
              type="number"
              required
              value={book.totalCopies}
              onChange={(e) => {
                const total = parseInt(e.target.value)
                onChange({
                  ...book,
                  totalCopies: total,
                  availableCopies: Math.min(book.availableCopies, total)
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies *</label>
            <input
              type="number"
              required
              value={book.availableCopies}
              onChange={(e) => onChange({...book, availableCopies: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              max={book.totalCopies}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={book.description}
            onChange={(e) => onChange({...book, description: e.target.value})}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter book description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input
            type="url"
            value={book.coverUrl}
            onChange={(e) => onChange({...book, coverUrl: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Or upload cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0]
              onChange({...book, coverFile: file, coverUrl: file ? '' : book.coverUrl})
              // manage preview URL
              if (file) {
                const url = URL.createObjectURL(file)
                setCoverPreview(url)
              } else {
                setCoverPreview('')
              }
            }}
            className="w-full"
          />
          {book.coverFile && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <img src={coverPreview || ''} alt="preview" className="w-32 h-40 object-cover rounded" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload book file (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0]
              onChange({...book, bookFile: file, fileUrl: file ? '' : book.fileUrl})
            }}
            className="w-full"
          />
          {book.bookFile && (
            <div className="mt-2 text-sm text-gray-600">
              Selected file: <span className="font-medium">{book.bookFile.name}</span> ({(book.bookFile.size/1024).toFixed(0)} KB)
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            Add Book
          </button>
        </div>
      </form>
    </div>
  </div>
)

// Edit Book Modal (similar to AddBookModal but for updating)
const EditBookModal = ({ book, onChange, onSubmit, onClose, coverPreview, setCoverPreview }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Edit Book</h3>
        <p className="text-gray-600 mt-1">Update the details for this book</p>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={book.title}
              onChange={(e) => onChange({...book, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter book title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
            <input
              type="text"
              required
              value={book.author}
              onChange={(e) => onChange({...book, author: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter author name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ISBN</label>
            <input
              type="text"
              value={book.isbn}
              onChange={(e) => onChange({...book, isbn: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter ISBN"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category (A-Level subject) *</label>
            <select
              required
              value={book.category}
              onChange={(e) => onChange({...book, category: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select A-Level subject</option>
              {A_LEVEL_SUBJECTS.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Categories are linked to Uganda A-Level subjects for easy curriculum mapping.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
            <input
              type="text"
              value={book.publisher}
              onChange={(e) => onChange({...book, publisher: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter publisher"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Published Year</label>
            <input
              type="number"
              value={book.publishedYear}
              onChange={(e) => onChange({...book, publishedYear: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="1000"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
            <input
              type="number"
              required
              value={book.totalCopies}
              onChange={(e) => {
                const total = parseInt(e.target.value)
                onChange({
                  ...book,
                  totalCopies: total,
                  availableCopies: Math.min(book.availableCopies, total)
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Copies *</label>
            <input
              type="number"
              required
              value={book.availableCopies}
              onChange={(e) => onChange({...book, availableCopies: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              max={book.totalCopies}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={book.description}
            onChange={(e) => onChange({...book, description: e.target.value})}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter book description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
          <input
            type="url"
            value={book.coverUrl}
            onChange={(e) => onChange({...book, coverUrl: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Or upload cover image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0]
              onChange({...book, coverFile: file, coverUrl: file ? '' : book.coverUrl})
              // manage preview URL
              if (file) {
                const url = URL.createObjectURL(file)
                setCoverPreview(url)
              } else {
                setCoverPreview('')
              }
            }}
            className="w-full"
          />
          {book.coverFile && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <img src={coverPreview || ''} alt="preview" className="w-32 h-40 object-cover rounded" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload book file (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files && e.target.files[0]
              onChange({...book, bookFile: file, fileUrl: file ? '' : book.fileUrl})
            }}
            className="w-full"
          />
          {book.bookFile && (
            <div className="mt-2 text-sm text-gray-600">
              Selected file: <span className="font-medium">{book.bookFile.name}</span> ({(book.bookFile.size/1024).toFixed(0)} KB)
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            Update Book
          </button>
        </div>
      </form>
    </div>
  </div>
)

// Delete Confirmation Modal
const DeleteModal = ({ book, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-2xl max-w-md w-full p-6">
      <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4 mx-auto">
        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Book</h3>
      <p className="text-gray-600 text-center mb-6">
        Are you sure you want to delete "<span className="font-semibold">{book?.title}</span>" by {book?.author}? This action cannot be undone.
      </p>
      
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-medium"
        >
          Delete Book
        </button>
      </div>
    </div>
  </div>
)

export default BookCatalog