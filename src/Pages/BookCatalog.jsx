import React, { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../lib/api'
import {
  BookOpen,
  FileText,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  Download,
  Check,
  X,
  AlertCircle,
  FileArchive,
  BookMarked,
  Calendar,
  Users,
  Package,
  Upload,
  Image,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  Clock
} from 'lucide-react'

const A_LEVEL_SUBJECTS = [
  'Biology', 'Chemistry', 'Physics', 'Mathematics', 'Economics', 'History', 'Geography', 
  'Literature in English', 'Computer Studies', 'Agriculture', 'Entrepreneurship', 
  'Fine Art', 'Commerce', 'French', 'Christian Religious Education'
]

const RESOURCE_TYPES = ['textbook', 'past_paper', 'reference', 'handbook', 'study_guide']
const RESOURCE_TYPE_LABELS = {
  textbook: 'Textbook',
  past_paper: 'Past Paper',
  reference: 'Reference',
  handbook: 'Handbook',
  study_guide: 'Study Guide'
}

const BookCatalog = () => {
  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
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
    fileUrl: '',
    resourceType: 'textbook',
    examYear: '',
    examBoard: 'UNEB'
  })

  const [coverPreview, setCoverPreview] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [bookToEdit, setBookToEdit] = useState(null)
  const [showUploadProgress, setShowUploadProgress] = useState(false)

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
        resourceType: b.resourceType || 'textbook',
        examYear: b.examYear || '',
        examBoard: b.examBoard || 'UNEB'
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

  useEffect(() => {
    return () => {
      if (coverPreview) {
        try { URL.revokeObjectURL(coverPreview) } catch (e) {}
      }
    }
  }, [coverPreview])

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

    if (typeFilter !== 'all') {
      filtered = filtered.filter(book => book.resourceType === typeFilter)
    }

    setFilteredBooks(filtered)
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter, typeFilter, books])

  const categories = ['all', ...new Set([
    ...A_LEVEL_SUBJECTS,
    ...books.map(book => book.category).filter(Boolean)
  ])]

  const indexOfLastBook = currentPage * booksPerPage
  const indexOfFirstBook = indexOfLastBook - booksPerPage
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)
  const totalPages = Math.ceil(filteredBooks.length / booksPerPage)

  const computeStats = () => {
    const now = new Date()
    const ms30 = 30 * 24 * 60 * 60 * 1000
    const cutoff = new Date(now.getTime() - ms30)
    const cutoffPrev = new Date(now.getTime() - ms30 * 2)

    const parseDate = (d) => {
      if (!d) return null
      const parsed = new Date(d)
      return isNaN(parsed.getTime()) ? null : parsed
    }

    const countAddedInRange = (start, end) => books.filter(b => {
      const ad = parseDate(b.addedDate)
      if (!ad) return false
      return ad > start && ad <= end
    }).length

    const addedLast30 = countAddedInRange(cutoff, now)
    const addedPrev30 = countAddedInRange(cutoffPrev, cutoff)

    const totalBooks = books.length

    const isOld = (b) => {
      const ad = parseDate(b.addedDate)
      if (!ad) return true
      return ad <= cutoff
    }

    const availableNow = books.filter(b => b.status === 'available').length
    const availablePrev = books.filter(b => isOld(b) && b.status === 'available').length

    const maintenanceNow = books.filter(b => b.status === 'maintenance').length
    const maintenancePrev = books.filter(b => isOld(b) && b.status === 'maintenance').length

    const pastPapers = books.filter(b => b.resourceType === 'past_paper').length

    const calcPercent = (prev, curr) => {
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
    const maintenanceChange = calcPercent(maintenancePrev, maintenanceNow)

    return {
      totalBooks,
      availableNow,
      maintenanceNow,
      pastPapers,
      addedLast30,
      totalChange,
      availableChange,
      maintenanceChange
    }
  }

  const stats = computeStats()

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageBookIds = currentBooks.map(book => book.id)
      setSelectedBooks(currentPageBookIds)
    } else {
      setSelectedBooks([])
    }
  }

  const handleBookSelect = (bookId) => {
    setSelectedBooks(prev =>
      prev.includes(bookId)
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    )
  }

  const handleDeleteBook = (book) => {
    setBookToDelete(book)
    setShowDeleteModal(true)
  }

  const handleEditBook = (book) => {
    setBookToEdit({ ...book })
    setCoverPreview(book.coverUrl || '')
    setShowEditModal(true)
  }

  const confirmDelete = async () => {
    if (!bookToDelete) return

    try {
      setLoading(true)
      const res = await apiFetch(`/api/admin/books/${bookToDelete.id}`, { method: 'DELETE' })
      setLoading(false)
      
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert('Failed to delete book: ' + (body.message || res.statusText))
        return
      }

      setBooks(books.filter(book => book.id !== bookToDelete.id))
      setSelectedBooks(selectedBooks.filter(id => id !== bookToDelete.id))
      setShowDeleteModal(false)
      setBookToDelete(null)
    } catch (err) {
      setLoading(false)
      console.error('Delete book error', err)
      alert('Failed to delete book')
    }
  }

  const handleAddBook = async (e) => {
    e.preventDefault()
    setShowUploadProgress(true)

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
      form.append('resourceType', newBook.resourceType)
      if (newBook.examYear) form.append('examYear', newBook.examYear)
      if (newBook.examBoard) form.append('examBoard', newBook.examBoard)

      const res = await apiFetch('/api/admin/books', {
        method: 'POST',
        body: form
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert('Failed to add book: ' + (body.message || res.statusText))
        return
      }

      await fetchBooks()
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
        fileUrl: '',
        resourceType: 'textbook',
        examYear: '',
        examBoard: 'UNEB'
      })
      setCoverPreview('')
    } catch (err) {
      console.error('Add book error', err)
      alert('Failed to add book')
    } finally {
      setShowUploadProgress(false)
    }
  }

  const handleUpdateBook = async (e) => {
    e.preventDefault()
    if (!bookToEdit) return
    setShowUploadProgress(true)

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
      form.append('resourceType', bookToEdit.resourceType)
      if (bookToEdit.examYear) form.append('examYear', bookToEdit.examYear)
      if (bookToEdit.examBoard) form.append('examBoard', bookToEdit.examBoard)

      const res = await apiFetch(`/api/admin/books/${bookToEdit.id}`, {
        method: 'PUT',
        body: form
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        alert('Failed to update book: ' + (body.message || res.statusText))
        return
      }

      await fetchBooks()
      setShowEditModal(false)
      setBookToEdit(null)
      setCoverPreview('')
    } catch (err) {
      console.error('Update book error', err)
      alert('Failed to update book')
    } finally {
      setShowUploadProgress(false)
    }
  }

  const updateBookStatus = (bookId, newStatus) => {
    setBooks(books.map(book =>
      book.id === bookId ? { ...book, status: newStatus } : book
    ))
  }

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) return
    if (!window.confirm(`Are you sure you want to delete ${selectedBooks.length} books?`)) return
    
    setLoading(true)
    try {
      // In a real app we might have a bulk delete endpoint. 
      // For now we'll delete each one individually to match the backend capability.
      const deletePromises = selectedBooks.map(id => 
        apiFetch(`/api/admin/books/${id}`, { method: 'DELETE' })
      )
      
      const results = await Promise.all(deletePromises)
      const failedCount = results.filter(r => !r.ok).length
      
      if (failedCount > 0) {
        alert(`${failedCount} books failed to delete.`)
      }
      
      await fetchBooks()
      setSelectedBooks([])
    } catch (err) {
      console.error('Bulk delete failed', err)
      alert('Failed to delete some books')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading catalog...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Book Catalog</h1>
          <p className="text-gray-600 mt-1">Manage textbooks, past papers, and study materials</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {selectedBooks.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected ({selectedBooks.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Resources"
          value={stats.totalBooks}
          change={stats.totalChange.text}
          trend={stats.totalChange.trend}
          icon={<BookOpen className="w-5 h-5" />}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Available"
          value={stats.availableNow}
          change={stats.availableChange.text}
          trend={stats.availableChange.trend}
          icon={<Check className="w-5 h-5" />}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="Past Papers"
          value={stats.pastPapers}
          change="+12%"
          trend="up"
          icon={<FileArchive className="w-5 h-5" />}
          iconColor="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          title="Needs Maintenance"
          value={stats.maintenanceNow}
          change={stats.maintenanceChange.text}
          trend={stats.maintenanceChange.trend}
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors duration-200"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors duration-200 appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <BookMarked className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors duration-200 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="maintenance">Maintenance</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors duration-200 appearance-none"
              >
                <option value="all">All Types</option>
                {RESOURCE_TYPES.map(type => (
                  <option key={type} value={type}>{RESOURCE_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>
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
                onEdit={handleEditBook}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">No resources found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <p className="text-sm text-gray-700">
              Showing {indexOfFirstBook + 1} to {Math.min(indexOfLastBook, filteredBooks.length)} of {filteredBooks.length} resources
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                if (pageNum < 1 || pageNum > totalPages) return null

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gray-800 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <ResourceModal
          mode="add"
          book={newBook}
          onChange={setNewBook}
          onSubmit={handleAddBook}
          onClose={() => setShowAddModal(false)}
          coverPreview={coverPreview}
          setCoverPreview={setCoverPreview}
          loading={showUploadProgress}
        />
      )}

      {/* Edit Resource Modal */}
      {showEditModal && bookToEdit && (
        <ResourceModal
          mode="edit"
          book={bookToEdit}
          onChange={setBookToEdit}
          onSubmit={handleUpdateBook}
          onClose={() => { setShowEditModal(false); setBookToEdit(null); setCoverPreview('') }}
          coverPreview={coverPreview}
          setCoverPreview={setCoverPreview}
          loading={showUploadProgress}
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
const BookCard = ({ book, selected, onSelect, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false)
  const actionsRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800'
      case 'unavailable': return 'bg-red-100 text-red-800'
      case 'maintenance': return 'bg-amber-100 text-amber-800'
      case 'lost': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'past_paper': return 'bg-purple-100 text-purple-800'
      case 'textbook': return 'bg-blue-100 text-blue-800'
      case 'reference': return 'bg-cyan-100 text-cyan-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return <Check className="w-3 h-3" />
      case 'unavailable': return <X className="w-3 h-3" />
      case 'maintenance': return <AlertCircle className="w-3 h-3" />
      default: return <Clock className="w-3 h-3" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'past_paper': return <FileArchive className="w-3 h-3" />
      case 'textbook': return <BookOpen className="w-3 h-3" />
      case 'reference': return <FileText className="w-3 h-3" />
      default: return <FileText className="w-3 h-3" />
    }
  }

  return (
    <div className={`bg-white rounded-lg border transition-all duration-150 ${
      selected ? 'border-gray-800 shadow-md' : 'border-gray-200 hover:shadow-sm hover:border-gray-300'
    }`}>
      <div className="p-4">
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(book.id)}
            className="w-4 h-4 text-gray-800 rounded focus:ring-gray-800 focus:ring-offset-0"
          />
          <div className="relative" ref={actionsRef}>
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>

            {showActions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                <button 
                  onClick={() => { onEdit(book); setShowActions(false); }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <Edit2 className="w-4 h-4 mr-3 text-gray-400" />
                  Edit Resource
                </button>
                <button 
                  onClick={() => { onDelete(book); setShowActions(false); }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors duration-150"
                >
                  <Trash2 className="w-4 h-4 mr-3 text-red-500" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Book Cover */}
        <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 overflow-hidden">
          {book.coverUrl ? (
            <img 
              src={book.coverUrl} 
              alt={book.title} 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        {/* Resource Type Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(book.resourceType)}`}>
            {getTypeIcon(book.resourceType)}
            {RESOURCE_TYPE_LABELS[book.resourceType] || book.resourceType}
          </div>
          {book.examYear && book.resourceType === 'past_paper' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              <Calendar className="w-3 h-3" />
              {book.examYear}
            </span>
          )}
        </div>

        {/* Book Info */}
        <div>
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2" title={book.title}>
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">{book.category}</span>
            <span className="text-xs font-medium text-gray-500">{book.publishedYear}</span>
          </div>

          {/* Status and Copies */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(book.status)}
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(book.status)}`}>
                {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-600">
              {book.availableCopies}/{book.totalCopies}
            </span>
          </div>

          {/* Download Link */}
          {book.fileUrl && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <a 
                href={book.fileUrl} 
                download
                className="inline-flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 hover:underline"
              >
                <Download className="w-3 h-3" />
                Download
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value, change, trend, icon, iconColor, bgColor }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-green-100 text-green-700' :
        trend === 'down' ? 'bg-red-100 text-red-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {change}
      </span>
    </div>
    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
    <div className="text-xl font-semibold text-gray-900">{value.toLocaleString()}</div>
  </div>
)

// Resource Modal (Shared for Add/Edit)
const ResourceModal = ({ mode, book, onChange, onSubmit, onClose, coverPreview, setCoverPreview, loading }) => {
  const isPastPaper = book.resourceType === 'past_paper'
  const title = mode === 'add' ? 'Add New Resource' : 'Edit Resource'

  const handleFileChange = (field, file) => {
    onChange({ ...book, [field]: file, [field === 'coverFile' ? 'coverUrl' : 'fileUrl']: '' })
    if (field === 'coverFile' && file) {
      const url = URL.createObjectURL(file)
      setCoverPreview(url)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              {mode === 'add' ? <Plus className="w-5 h-5 text-gray-700" /> : <Edit2 className="w-5 h-5 text-gray-700" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">Fill in the resource details</p>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Resource Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type *</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {RESOURCE_TYPES.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ ...book, resourceType: type })}
                  className={`p-3 rounded-lg border transition-colors ${
                    book.resourceType === type 
                      ? 'bg-gray-800 text-white border-gray-800' 
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-xs font-medium">{RESOURCE_TYPE_LABELS[type]}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={book.title}
                onChange={(e) => onChange({...book, title: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter resource title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
              <input
                type="text"
                required
                value={book.author}
                onChange={(e) => onChange({...book, author: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter author name"
              />
            </div>

            {isPastPaper && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Year *</label>
                  <input
                    type="number"
                    required
                    value={book.examYear}
                    onChange={(e) => onChange({...book, examYear: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                    placeholder="e.g., 2023"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Exam Board *</label>
                  <select
                    required
                    value={book.examBoard}
                    onChange={(e) => onChange({...book, examBoard: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                  >
                    <option value="UNEB">UNEB (Uganda)</option>
                    <option value="UCE">UCE</option>
                    <option value="UACE">UACE</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
              <input
                type="text"
                value={book.isbn}
                onChange={(e) => onChange({...book, isbn: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter ISBN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category (A-Level subject) *</label>
              <select
                required
                value={book.category}
                onChange={(e) => onChange({...book, category: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
              >
                <option value="">Select A-Level subject</option>
                {A_LEVEL_SUBJECTS.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Publisher</label>
              <input
                type="text"
                value={book.publisher}
                onChange={(e) => onChange({...book, publisher: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                placeholder="Enter publisher"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Published Year</label>
              <input
                type="number"
                value={book.publishedYear}
                onChange={(e) => onChange({...book, publishedYear: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Copies *</label>
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
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Copies *</label>
              <input
                type="number"
                required
                value={book.availableCopies}
                onChange={(e) => onChange({...book, availableCopies: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                min="0"
                max={book.totalCopies}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={book.description}
              onChange={(e) => onChange({...book, description: e.target.value})}
              rows="3"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 resize-none"
              placeholder="Enter resource description"
            />
          </div>

          {/* File Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="flex flex-col items-center">
                  <Image className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload cover image</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('coverFile', e.target.files[0])}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">or enter URL below</p>
                </div>
              </div>
              {book.coverUrl && !book.coverFile && (
                <input
                  type="url"
                  value={book.coverUrl}
                  onChange={(e) => onChange({...book, coverUrl: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg mt-2"
                  placeholder="Cover image URL"
                />
              )}
              {coverPreview && (
                <div className="mt-2">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img src={coverPreview} alt="preview" className="w-32 h-40 object-cover rounded" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resource File</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors">
                <div className="flex flex-col items-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Upload {book.resourceType === 'past_paper' ? 'past paper' : 'book'} file</p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange('bookFile', e.target.files[0])}
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX formats</p>
                </div>
              </div>
              {book.fileUrl && !book.bookFile && (
                <input
                  type="url"
                  value={book.fileUrl}
                  onChange={(e) => onChange({...book, fileUrl: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg mt-2"
                  placeholder="File URL"
                />
              )}
              {book.bookFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: <span className="font-medium">{book.bookFile.name}</span> ({(book.bookFile.size/1024).toFixed(0)} KB)
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Uploading...
                </div>
              ) : mode === 'add' ? (
                'Add Resource'
              ) : (
                'Update Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
const DeleteModal = ({ book, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
    <div className="bg-white rounded-xl max-w-md w-full p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Resource</h3>
          <p className="text-sm text-gray-600">This action cannot be undone</p>
        </div>
      </div>
      
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="font-medium text-gray-900">{book?.title}</p>
        <p className="text-sm text-gray-500">{book?.author}</p>
        <p className="text-xs text-gray-400 mt-1">{book?.category}</p>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
        >
          Delete Resource
        </button>
      </div>
    </div>
  </div>
)

export default BookCatalog