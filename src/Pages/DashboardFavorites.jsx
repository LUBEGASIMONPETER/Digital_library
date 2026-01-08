import React, { useState, useEffect } from 'react'
import BookCard from '../Components/Dashboard/BookCard'
import { apiFetch } from '../lib/api'
import { Heart, Search, BookOpen } from 'lucide-react'

const DashboardFavorites = () => {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await apiFetch('/api/users/favorites')
        if (res.ok) {
          const data = await res.json()
          const mapped = (data.favorites || []).map(b => ({
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
            resourceType: b.resourceType || 'textbook',
          }))
          setFavorites(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch favorites:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFavorites()
  }, [])

  const filteredFavorites = favorites.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-6 h-6 text-blue-600 fill-current" />
            My Favorites
          </h1>
          <p className="text-slate-500 text-sm">Books you've saved for later study.</p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search favorites..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredFavorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFavorites.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No favorites yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">
            Explore the library and click the heart icon to save resources you want to read again.
          </p>
          <a 
            href="/dashboard/library" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            Browse Library
          </a>
        </div>
      )}
    </div>
  )
}

export default DashboardFavorites