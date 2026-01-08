import React, { useState, useEffect } from 'react'
import BookCard from '../Components/Dashboard/BookCard'
import { apiFetch } from '../lib/api'
import { Download, Search, BookOpen, Clock } from 'lucide-react'

const DashboardDownloads = () => {
  const [downloads, setDownloads] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        // We'll create this endpoint soon
        const res = await apiFetch('/api/users/downloads')
        if (res.ok) {
          const data = await res.json()
          const mapped = (data.downloads || []).map(b => ({
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
          setDownloads(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch downloads:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDownloads()
  }, [])

  const filteredDownloads = downloads.filter(book =>
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
            <Download className="w-6 h-6 text-blue-600" />
            My Downloads
          </h1>
          <p className="text-slate-500 text-sm">Offline resources and saved files.</p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search downloads..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center gap-4">
        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
          <Clock className="w-5 h-5" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-blue-900 leading-none mb-1">Study Tip</p>
          <p className="text-blue-700">Downloaded resources are available even when you have no internet access.</p>
        </div>
      </div>

      {filteredDownloads.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDownloads.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Download className="w-8 h-8 text-blue-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">No downloads yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-6">
            You haven't downloaded any files yet. Download books to read them offline later.
          </p>
          <a 
            href="/dashboard/library" 
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-md hover:shadow-lg"
          >
            <BookOpen className="w-4 h-4" />
            Visit Library
          </a>
        </div>
      )}
    </div>
  )
}

export default DashboardDownloads