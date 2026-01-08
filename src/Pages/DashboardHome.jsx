import React, { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { BookOpen, Download, Heart, Clock, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const DashboardHome = () => {
  const { user: authUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    resourcesRead: 0,
    downloaded: 0,
    favorites: 0,
    studyHours: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await apiFetch('/api/users/dashboard-stats')
        if (res.ok) {
          const data = await res.json()
          setStats({
            resourcesRead: data.stats.totalBooksRead || 0,
            downloaded: data.stats.downloadedResources || 0,
            favorites: data.stats.favoritesCount || 0,
            studyHours: data.stats.studyHours || 0
          })
          setRecentActivity(data.stats.recentActivity || [])
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {authUser?.name || 'Student'}!</h1>
          <p className="text-gray-500">Track your progress and continue your learning journey.</p>
        </div>
        <Link 
          to="/dashboard/profile"
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          View Profile
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Resources Read', value: stats.resourcesRead, icon: <BookOpen className="w-5 h-5" />, color: 'blue' },
          { label: 'Downloaded', value: stats.downloaded, icon: <Download className="w-5 h-5" />, color: 'emerald' },
          { label: 'Saved Items', value: stats.favorites, icon: <Heart className="w-5 h-5" />, color: 'rose' },
          { label: 'Study Hours', value: stats.studyHours, icon: <Clock className="w-5 h-5" />, color: 'amber' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
            <Link to="/dashboard/profile" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 group">
              View History
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length > 0 ? recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-gray-900">{activity.title}</h4>
                  <p className="text-xs text-gray-500">{activity.type} • {activity.timeAgo}</p>
                </div>
                <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600" style={{ width: `${activity.progress}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-200" />
                </div>
                <p className="text-gray-500 text-sm italic">Nothing here yet. Time to dive into the library!</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
            <h3 className="text-lg font-bold mb-2">My Library</h3>
            <p className="text-blue-100 text-sm mb-4">You have {stats.favorites} items saved for later review.</p>
            <Link 
              to="/dashboard/library" 
              className="w-full inline-block text-center py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition"
            >
              Continue Learning
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Support</h3>
            <p className="text-gray-500 text-sm mb-4">Need help using the platform? Our team is available 24/7.</p>
            <Link 
              to="/dashboard/support" 
              className="w-full inline-block text-center py-2.5 bg-gray-50 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
            >
              Get Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
