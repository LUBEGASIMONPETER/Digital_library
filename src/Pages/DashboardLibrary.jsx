import React, { useState, useMemo, useEffect } from 'react'
import BookCard from '../Components/Dashboard/BookCard'
import { apiFetch } from '../lib/api'

const DashboardLibrary = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    author: '',
    search: ''
  })

  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  // Fetch books from backend and map to UI shape used by BookCard
  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoading(true)
      try {
  const res = await apiFetch('/api/admin/books')
        if (!res.ok) {
          console.error('Failed to fetch books for library', res.status)
          if (mounted) setBooks([])
          return
        }
        const body = await res.json()
        const serverBooks = Array.isArray(body.books) ? body.books : body
        const mapped = serverBooks.map(b => ({
          id: b._id || b.id,
          title: b.title,
          author: b.author || 'Unknown',
          description: b.description || '',
          image: b.coverUrl || b.cover || '/APP_LOGO.png',
          fileUrl: b.fileUrl || b.file || '',
          category: b.category || '',
          // readers/downloads absent in backend - approximate with borrowCount
          readers: b.borrowCount || 0,
          downloads: b.downloadCount || 0,
          rating: b.rating || null,
          pages: b.pages || null,
          subject: b.category || '',
          class: b.level || '',
        }))
        if (mounted) setBooks(mapped)
      } catch (err) {
        console.error('Error fetching library books', err)
        if (mounted) setBooks([])
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  // Get unique values for filter dropdowns (from real books)
  const uniqueClasses = [...new Set(books.map(book => book.class).filter(Boolean))]
  const uniqueSubjects = [...new Set(books.map(book => book.subject).filter(Boolean))]
  const uniqueAuthors = [...new Set(books.map(book => book.author).filter(Boolean))]

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const matchesClass = !filters.class || book.class === filters.class
      const matchesSubject = !filters.subject || book.subject === filters.subject
      const matchesAuthor = !filters.author || book.author === filters.author
      const matchesSearch = !filters.search || 
        book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        book.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        book.author.toLowerCase().includes(filters.search.toLowerCase())

      return matchesClass && matchesSubject && matchesAuthor && matchesSearch
    })

    // Sort books
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.readers - a.readers)
        break
      case 'downloads':
        filtered.sort((a, b) => b.downloads - a.downloads)
        break
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        break
    }

    return filtered
  }, [filters, sortBy, books])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      class: '',
      subject: '',
      author: '',
      search: ''
    })
    setSortBy('popular')
  }

  const hasActiveFilters = filters.class || filters.subject || filters.author || filters.search

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-48">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-gray-600">Discover and borrow educational resources</p>
        </div>
        <div className="mt-4 lg:mt-0 flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>📚</span>
            <span>{filteredBooks.length} books</span>
          </div>
        </div>
      </div>

      {/* Main Search and Controls */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books, authors, or topics..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="popular">Most Popular</option>
              <option value="downloads">Most Downloads</option>
              <option value="title">Title A-Z</option>
              <option value="rating">Highest Rated</option>
            </select>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl border transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400'
              }`}
            >
              <span>⚙️</span>
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 text-red-600 hover:text-red-700 font-medium transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={filters.class}
                  onChange={(e) => handleFilterChange('class', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Author
                </label>
                <select
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Authors</option>
                  {uniqueAuthors.map(author => (
                    <option key={author} value={author}>{author}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Badges */}
        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.class && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Class: {filters.class}
                <button 
                  onClick={() => handleFilterChange('class', '')}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.subject && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                Subject: {filters.subject}
                <button 
                  onClick={() => handleFilterChange('subject', '')}
                  className="ml-2 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.author && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Author: {filters.author}
                <button 
                  onClick={() => handleFilterChange('author', '')}
                  className="ml-2 hover:text-purple-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardLibrary