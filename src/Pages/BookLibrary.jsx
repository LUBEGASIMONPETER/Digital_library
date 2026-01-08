import React, { useState, useEffect, useMemo, useRef } from 'react'
import { apiFetch } from '../lib/api'
import BookCard from '../Components/Dashboard/BookCard'
import { 
  Search, 
  Filter, 
  BookOpen, 
  Loader2,
  BookMarked,
  Library,
  X,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SlidersHorizontal
} from 'lucide-react'

const BookLibrary = () => {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showCatMenu, setShowCatMenu] = useState(false)
  const [isFixed, setIsFixed] = useState(false)
  const [stickyHeight, setStickyHeight] = useState(0)
  const [navbarHeight, setNavbarHeight] = useState(0)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('popular') // 'popular', 'newest', 'title', 'author'
  const containerRef = useRef(null)
  const stickyRef = useRef(null)
  const origOffset = useRef(0)

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true)
      try {
        // Use public books endpoint for library browsing
        const res = await apiFetch('/api/books')
        if (res.ok) {
          const data = await res.json()
          const mapped = (data.books || []).map(b => ({
            id: b._id,
            title: b.title,
            author: b.author,
            description: b.description || 'No description available.',
            coverUrl: b.coverUrl,
            fileUrl: b.fileUrl,
            image: b.coverUrl || '/APP_LOGO.png',
            category: b.category,
            readers: b.borrowCount || 0,
            downloads: b.borrowCount || 0,
            rating: null,
            dateAdded: b.createdAt || new Date().toISOString(),
          }))
          setBooks(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch books:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  const categories = ['all', ...new Set(books.map(b => b.category).filter(Boolean))]

  const filteredBooks = useMemo(() => {
    let result = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter
      return matchesSearch && matchesCategory
    })

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'author':
        result.sort((a, b) => a.author.localeCompare(b.author))
        break
      case 'popular':
      default:
        result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
        break
    }

    return result
  }, [books, searchTerm, categoryFilter, sortBy])

  const stats = useMemo(() => ({
    totalBooks: books.length,
    filteredCount: filteredBooks.length,
    totalCategories: categories.length - 1,
  }), [books.length, filteredBooks.length, categories.length])

  useEffect(() => {
    const measure = () => {
      const hdr = document.querySelector('header')
      const h = hdr ? Math.ceil(hdr.getBoundingClientRect().height) : 64
      setNavbarHeight(h)
      
      if (containerRef.current && stickyRef.current) {
        const contRect = containerRef.current.getBoundingClientRect()
        setStickyHeight(Math.ceil(stickyRef.current.getBoundingClientRect().height))
        origOffset.current = stickyRef.current.getBoundingClientRect().top + window.scrollY
      }
    }

    const onScroll = () => {
      if (!origOffset.current) return
      // Account for navbar height in the calculation
      const shouldFix = window.scrollY + navbarHeight + 20 >= origOffset.current
      if (shouldFix !== isFixed) setIsFixed(shouldFix)
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', onScroll)
    }
  }, [isFixed, navbarHeight])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCatMenu && !event.target.closest('.category-dropdown')) {
        setShowCatMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showCatMenu])

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'title', label: 'Title (A-Z)' },
    { value: 'author', label: 'Author (A-Z)' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-20">
       

        {/* Stats Cards - Hidden on mobile */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Books</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBooks}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <BookMarked className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Showing</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.filteredCount}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCategories}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <Filter className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Search & Filter Section */}
        <div className="relative" ref={containerRef}>
          {/* Placeholder div to prevent layout shift */}
          {isFixed && <div style={{ height: stickyHeight }} aria-hidden />}
          
          <div
            ref={stickyRef}
            className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-4 md:p-6 mb-10 transition-all duration-300 ${
              isFixed 
                ? 'fixed left-0 right-0 z-40 shadow-xl border-t border-gray-300 md:left-auto md:right-auto md:w-[calc(100%-2rem)] mx-auto animate-in slide-in-from-top duration-200' 
                : 'relative'
            }`}
            style={{
              top: isFixed ? `${navbarHeight}px` : undefined,
            }}
          >
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Main Filters */}
              <div className="flex sm:flex-row gap-4 flex-1">
                {/* Search Input */}
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search books, authors, or keywords..."
                      className="pl-10 pr-10 py-3 w-full border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-r-xl p-1 transition-colors"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="category-dropdown relative">
                  <button
                    type="button"
                    onClick={() => setShowCatMenu(s => !s)}
                    className="flex items-center justify-between gap-2 px-4 py-3 w-full sm:w-auto border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-200 bg-gray-50"
                    aria-haspopup="true"
                    aria-expanded={showCatMenu}
                  >
                    <Filter className="h-5 w-5 text-gray-600 flex-shrink-0" />
                    <span className="hidden sm:inline truncate max-w-[120px]">
                      {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${showCatMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showCatMenu && (
                    <div className="absolute top-full right-0  md:left-[-120px] mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-in fade-in duration-150">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Filter by Category
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          <button
                            onClick={() => { setCategoryFilter('all'); setShowCatMenu(false) }}
                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${
                              categoryFilter === 'all' ? 'bg-blue-50 text-blue-700' : ''
                            }`}
                          >
                            <span>All Categories</span>
                            {categoryFilter === 'all' && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </button>
                          {categories.filter(cat => cat !== 'all').map(cat => (
                            <button
                              key={cat}
                              onClick={() => { setCategoryFilter(cat); setShowCatMenu(false) }}
                              className={`w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                categoryFilter === cat ? 'bg-blue-50 text-blue-700' : ''
                              }`}
                            >
                              <span className="truncate">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                              {categoryFilter === cat && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              
            </div>

            {/* Active Filters */}
            {(searchTerm || categoryFilter !== 'all') && (
              <div className="mt-4 pt-4 border-t border-gray-100 animate-in fade-in duration-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500 font-medium">Active filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium shadow-sm">
                      <Search className="h-3 w-3" />
                      "{searchTerm}"
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="ml-1 hover:text-blue-900 transition-colors"
                        aria-label="Remove search filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium shadow-sm">
                      <Filter className="h-3 w-3" />
                      {categoryFilter}
                      <button 
                        onClick={() => setCategoryFilter('all')}
                        className="ml-1 hover:text-green-900 transition-colors"
                        aria-label="Remove category filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {(searchTerm || categoryFilter !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        setCategoryFilter('all')
                      }}
                      className="ml-auto text-sm text-gray-600 hover:text-gray-900 hover:underline transition-colors flex items-center gap-1"
                    >
                      <X className="h-3 w-3" />
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Available Books <span className="text-gray-500">({filteredBooks.length})</span>
          </h2>
          <div className="text-sm text-gray-500 hidden md:flex items-center gap-1">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Sorted by</span>
            <span className="font-medium text-gray-700 ml-1">
              {sortOptions.find(opt => opt.value === sortBy)?.label}
            </span>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py- bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium">Loading library collection...</p>
            <p className="text-gray-400 text-sm mt-2">Fetching your digital books</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className={`grid ${viewMode === 'list' ? 'grid-cols-1 gap-4' : 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2'}`}>
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-200 animate-in fade-in duration-300">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || categoryFilter !== 'all' 
                ? "We couldn't find any books matching your search criteria. Try adjusting your filters."
                : "The library is currently empty. Check back soon for new additions!"}
            </p>
            {(searchTerm || categoryFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCategoryFilter('all')
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                View All Books
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BookLibrary