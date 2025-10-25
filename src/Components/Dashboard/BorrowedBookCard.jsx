import React from 'react'

const formatDueLabel = (dueDate) => {
  if (!dueDate) return 'No due date'
  const now = new Date()
  const diff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Due today'
  if (diff === 1) return 'Due tomorrow'
  if (diff > 1) return `Due in ${diff} days`
  const past = Math.abs(diff)
  if (past === 1) return 'Overdue by 1 day'
  return `Overdue by ${past} days`
}

const getDueStatusColor = (dueDate) => {
  if (!dueDate) return 'gray'
  const now = new Date()
  const diff = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
  
  if (diff < 0) return 'red' // Overdue
  if (diff === 0) return 'orange' // Due today
  if (diff <= 3) return 'amber' // Due in 1-3 days
  return 'green' // Due in more than 3 days
}

const BorrowedBookCard = ({ book, onRenew, onReturn }) => {
  const dueDate = book.dueDate ? (typeof book.dueDate === 'string' ? new Date(book.dueDate) : book.dueDate) : null
  const statusColor = getDueStatusColor(dueDate)
  const dueLabel = formatDueLabel(dueDate)
  const borrowedDate = book.borrowedDate ? new Date(book.borrowedDate) : null

  const statusColors = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-800 border-red-200'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800 border-orange-200'
    },
    amber: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-700',
      badge: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-800 border-green-200'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      badge: 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const colorSet = statusColors[statusColor]

  return (
    <div className={`rounded-xl border-2 ${colorSet.border} ${colorSet.bg} transition-all duration-200 hover:shadow-lg hover:scale-[1.02]`}>
      <div className="flex flex-col sm:flex-row gap-4 p-5">
        {/* Book Cover */}
        <div className="w-full sm:w-32 h-40 flex-shrink-0 bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
          <img
            src={book.image || '/APP_LOGO.png'}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.src = '/APP_LOGO.png'
            }}
          />
        </div>

        {/* Book Details */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold text-gray-900 truncate" title={book.title}>
                {book.title}
              </h3>
              <p className="text-md text-gray-600 mt-1 truncate">
                by {book.author || 'Unknown Author'}
              </p>
            </div>
            
            {/* Status Badge */}
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colorSet.badge} whitespace-nowrap`}>
              {dueLabel}
            </div>
          </div>

          {/* Note Section */}
          {book.note && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600 italic">📝 {book.note}</p>
            </div>
          )}

          {/* Footer Section */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Dates Info */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm text-gray-600">
                {borrowedDate && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">📅</span>
                    <span>Borrowed {borrowedDate.toLocaleDateString()}</span>
                  </div>
                )}
                
                {dueDate && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">⏰</span>
                    <span>Due {dueDate.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onRenew && onRenew(book)}
                  disabled={statusColor === 'red'} // Disable renew if overdue
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    statusColor === 'red' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 shadow-sm'
                  }`}
                  title={statusColor === 'red' ? 'Cannot renew overdue books' : 'Renew this book'}
                >
                  <span>↻</span>
                  Renew
                </button>

                <button
                  onClick={() => onReturn && onReturn(book)}
                  className="px-4 py-2.5 rounded-lg bg-white text-gray-700 border border-gray-300 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 active:scale-95 transition-all duration-200 flex items-center gap-2 shadow-sm"
                >
                  <span>📚</span>
                  Return
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar for Urgency */}
      {dueDate && (
        <div className="w-full bg-gray-200 h-1">
          <div 
            className={`h-full transition-all duration-500 ${
              statusColor === 'red' ? 'bg-red-500' :
              statusColor === 'orange' ? 'bg-orange-500' :
              statusColor === 'amber' ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{
              width: dueDate < new Date() ? '100%' : '100%' // Visual indicator of urgency
            }}
          />
        </div>
      )}
    </div>
  )
}

export default BorrowedBookCard