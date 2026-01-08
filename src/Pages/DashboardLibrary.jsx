import React, { useState, useMemo, useEffect } from 'react'
import BookCard from '../Components/Dashboard/BookCard'
import { apiFetch } from '../lib/api'
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  BookOpen,
  TrendingUp,
  Download,
  Star,
  ChevronDown,
  BookMarked,
  User
} from 'lucide-react'

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
        // Use books API (authenticated users get full details including fileUrl)
        const res = await apiFetch('/api/books')
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
          readers: b.borrowCount || 0,
          downloads: b.borrowCount || 0,
          rating: null,
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
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Library</h1>
          <p className="text-gray-600 mt-1">Discover and access educational resources</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <BookOpen className="w-4 h-4" />
            <span>{filteredBooks.length} resources</span>
          </div>
        </div>
      </div>

      {/* Main Search and Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources, authors, or topics..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200 text-sm"
              >
                <option value="popular">Most Popular</option>
                <option value="downloads">Most Downloads</option>
                <option value="title">Title A-Z</option>
                <option value="rating">Highest Rated</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <SlidersHorizontal className={`w-4 h-4 ${hasActiveFilters ? 'text-blue-600' : ''}`} />
              <span className="text-sm font-medium">Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
              )}
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
              >
                <X className="w-4 h-4" />
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <BookMarked className="w-4 h-4 text-gray-400" />
                  Class
                </label>
                <select
                  value={filters.class}
                  onChange={(e) => handleFilterChange('class', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                >
                  <option value="">All Classes</option>
                  {uniqueClasses.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  Subject
                </label>
                <select
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
                >
                  <option value="">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-400" />
                  Author
                </label>
                <select
                  value={filters.author}
                  onChange={(e) => handleFilterChange('author', e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all duration-200"
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                <BookMarked className="w-3 h-3" />
                {filters.class}
                <button 
                  onClick={() => handleFilterChange('class', '')}
                  className="ml-1 hover:text-blue-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.subject && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                <BookOpen className="w-3 h-3" />
                {filters.subject}
                <button 
                  onClick={() => handleFilterChange('subject', '')}
                  className="ml-1 hover:text-green-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.author && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                <User className="w-3 h-3" />
                {filters.author}
                <button 
                  onClick={() => handleFilterChange('author', '')}
                  className="ml-1 hover:text-purple-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                <Search className="w-3 h-3" />
                "{filters.search}"
                <button 
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 hover:text-gray-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Books Grid */}
      {filteredBooks.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Resources <span className="text-gray-500">({filteredBooks.length})</span>
            </h2>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4" />
              Sorted by {sortBy === 'popular' ? 'Most Popular' : 
                        sortBy === 'downloads' ? 'Most Downloads' : 
                        sortBy === 'title' ? 'Title A-Z' : 'Highest Rated'}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We couldn't find any resources matching your search criteria. Try adjusting your filters or search terms.
          </p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <X className="w-4 h-4" />
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default DashboardLibrary