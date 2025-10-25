import React, { useState, useMemo } from 'react'
import BorrowedBookCard from '../Components/Dashboard/BorrowedBookCard'

// Sample borrowed books data
const SAMPLE_BORROWED = [
  {
    id: 1,
    title: 'Advanced Physics: Principles and Applications',
    author: 'Dr. James Mugisha',
    image: '/book-covers/physics.jpg',
    borrowedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    note: 'Please return or renew to avoid fines.',
    isbn: '978-0123456789',
    category: 'Science'
  },
  {
    id: 2,
    title: 'Calculus I: Fundamentals and Applications',
    author: 'Prof. Sarah Kato',
    image: '/book-covers/calculus.jpg',
    borrowedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    note: 'Renewals available once.',
    isbn: '978-0987654321',
    category: 'Mathematics'
  },
  {
    id: 3,
    title: 'Modern Chemistry: Concepts and Experiments',
    author: 'Dr. Robert Ssemakula',
    image: '/book-covers/chemistry.jpg',
    borrowedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    isbn: '978-1122334455',
    category: 'Science'
  },
  {
    id: 4,
    title: 'Introduction to Computer Science',
    author: 'Dr. Grace Nalwanga',
    image: '/book-covers/computer-science.jpg',
    borrowedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    note: 'Recommended reading completed',
    isbn: '978-5566778899',
    category: 'Technology'
  }
]

const DashboardBorrowed = () => {
  const [books, setBooks] = useState(SAMPLE_BORROWED)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')

  // Filter and sort books
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books.filter(book => {
      const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (filterStatus === 'all') return matchesSearch
      
      const now = new Date()
      const dueDate = new Date(book.dueDate)
      const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      
      switch (filterStatus) {
        case 'overdue':
          return matchesSearch && diffDays < 0
        case 'dueSoon':
          return matchesSearch && diffDays >= 0 && diffDays <= 3
        case 'safe':
          return matchesSearch && diffDays > 3
        default:
          return matchesSearch
      }
    })

    // Sort books
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          return new Date(a.dueDate) - new Date(b.dueDate)
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'borrowedDate':
          return new Date(b.borrowedDate) - new Date(a.borrowedDate)
        default:
          return 0
      }
    })
  }, [books, searchTerm, filterStatus, sortBy])

  // Statistics
  const stats = useMemo(() => {
    const now = new Date()
    return {
      total: books.length,
      overdue: books.filter(book => new Date(book.dueDate) < now).length,
      dueSoon: books.filter(book => {
        const diff = Math.ceil((new Date(book.dueDate) - now) / (1000 * 60 * 60 * 24))
        return diff >= 0 && diff <= 3
      }).length,
      safe: books.filter(book => {
        const diff = Math.ceil((new Date(book.dueDate) - now) / (1000 * 60 * 60 * 24))
        return diff > 3
      }).length
    }
  }, [books])

  const handleRenew = (book) => {
    setBooks(prev => prev.map(b => 
      b.id === book.id 
        ? { 
            ...b, 
            dueDate: new Date(new Date(b.dueDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            note: b.note ? `${b.note} • Renewed on ${new Date().toLocaleDateString()}` : `Renewed on ${new Date().toLocaleDateString()}`
          } 
        : b
    ))
  }

  const handleReturn = (book) => {
    setBooks(prev => prev.filter(b => b.id !== book.id))
  }

  const handleReturnAll = () => {
    if (window.confirm('Are you sure you want to return all books? This action cannot be undone.')) {
      setBooks([])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/30 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Borrowed Books</h1>
              <p className="text-lg text-gray-600 mt-2">Manage your current loans and due dates</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-sm text-gray-500">Active loans</div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                📚
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                </div>
                <div className="text-red-500 text-xl">⚠️</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Soon</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.dueSoon}</p>
                </div>
                <div className="text-amber-500 text-xl">⏰</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">On Track</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.safe}</p>
                </div>
                <div className="text-green-500 text-xl">✅</div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
              {/* Search */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search books or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                >
                  <option value="all">All Books</option>
                  <option value="overdue">Overdue</option>
                  <option value="dueSoon">Due Soon (≤3 days)</option>
                  <option value="safe">On Track</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                >
                  <option value="dueDate">Sort by Due Date</option>
                  <option value="title">Sort by Title</option>
                  <option value="author">Sort by Author</option>
                  <option value="borrowedDate">Sort by Borrowed Date</option>
                </select>
              </div>
            </div>

            {books.length > 0 && (
              <button
                onClick={handleReturnAll}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 active:scale-95 transition-all duration-200 font-medium whitespace-nowrap"
              >
                Return All
              </button>
            )}
          </div>
        </div>

        {/* Books Grid */}
        {filteredAndSortedBooks.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {books.length === 0 ? 'No Borrowed Books' : 'No Books Found'}
            </h3>
            <p className="text-gray-600 text-lg mb-6 max-w-md mx-auto">
              {books.length === 0 
                ? 'You have no books checked out right now. Visit the library to discover new books!'
                : 'No books match your current search or filter criteria.'
              }
            </p>
            {books.length === 0 && (
              <button className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:scale-95 transition-all duration-200 font-medium text-lg">
                Browse Library
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-gray-500">
              Showing {filteredAndSortedBooks.length} of {books.length} books
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {filteredAndSortedBooks.map(book => (
                <BorrowedBookCard
                  key={book.id}
                  book={book}
                  onRenew={handleRenew}
                  onReturn={handleReturn}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Footer */}
        {books.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium">
                📧 Email Due Dates
              </button>
              <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium">
                📋 Export List
              </button>
              <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium">
                ⭐ Request Extension
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardBorrowed