import React, { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Mail, 
  Calendar, 
  BookOpen, 
  Clock, 
  Award, 
  Edit3,
  Book,
  Heart,
  History,
  TrendingUp,
  Shield,
  GraduationCap,
  Download,
  Eye,
  Star,
  CheckCircle,
  ChevronRight,
  Settings,
  MapPin,
  LogOut,
  UserCircle,
  HelpCircle
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Profile = () => {
  const { user: authUser, signOut } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    resourcesRead: 0,
    downloaded: 0,
    favorites: 0,
    studyHours: 0,
    joinedDate: ''
  })
  
  const [recentActivities, setRecentActivities] = useState([])
  const [favorites, setFavorites] = useState([])
  const [achievements, setAchievements] = useState({ list: [], unlocked: 0, total: 0, points: 0 })

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true)
      try {
        const [statsRes, favsRes, profileRes, achievementsRes] = await Promise.all([
          apiFetch('/api/users/dashboard-stats'),
          apiFetch('/api/users/favorites'),
          apiFetch('/api/users/me'),
          apiFetch('/api/users/achievements')
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats({
            resourcesRead: statsData.stats.totalBooksRead || 0,
            downloaded: statsData.stats.downloadedResources || 0,
            favorites: statsData.stats.favoritesCount || 0,
            studyHours: statsData.stats.studyHours || 0,
            joinedDate: new Date(statsData.user.createdAt || statsData.user.joinDate || Date.now()).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
          })
          setRecentActivities(statsData.stats.recentActivity || [])
        }

        if (favsRes.ok) {
          const favsData = await favsRes.json()
          setFavorites(favsData.favorites || [])
          setStats(s => ({ ...s, favorites: favsData.favorites?.length || 0 }))
        }

        if (profileRes.ok) {
          const pData = await profileRes.json()
          setProfile(pData.user)
        }

        if (achievementsRes.ok) {
          const achData = await achievementsRes.json()
          const unlockedList = (achData.achievements || []).filter(a => a.unlocked)
          setAchievements({
            list: unlockedList,
            unlocked: achData.stats?.unlockedCount || unlockedList.length,
            total: achData.stats?.totalCount || achData.achievements?.length || 0,
            points: achData.stats?.totalPoints || 0
          })
        }
      } catch (err) {
        console.error('Failed to fetch profile stats:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfileData()
  }, [])

  const handleSignOut = () => {
    signOut()
    window.location.href = '/'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Profile Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full -ml-16 -mb-16 opacity-50" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-emerald-600 p-1 shadow-2xl overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <div className="w-full h-full rounded-[22px] bg-white overflow-hidden flex items-center justify-center">
                    {profile?.avatarUrl ? (
                      <img 
                        src={profile.avatarUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle className="w-20 h-20 text-gray-200" />
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-white w-8 h-8 rounded-full shadow-lg" />
              </div>
              
              <div className="text-center md:text-left">
                <div className="mb-3">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    {profile?.name || authUser?.name || 'Student Member'}
                  </h1>
                  <p className="text-gray-500 font-medium">
                    Member since {stats.joinedDate || 'Recently'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100 uppercase tracking-wider">
                    {authUser?.role || 'Student'}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-semibold rounded-full border border-emerald-100">
                    Active Learner
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all duration-300 shadow-lg shadow-gray-200"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Resources Read', value: stats.resourcesRead, icon: <BookOpen className="w-6 h-6" />, color: 'blue' },
            { label: 'Downloaded', value: stats.downloaded, icon: <Download className="w-6 h-6" />, color: 'emerald' },
            { label: 'Favorites', value: stats.favorites, icon: <Heart className="w-6 h-6" />, color: 'rose' },
            { label: 'Study Hours', value: stats.studyHours, icon: <Clock className="w-6 h-6" />, color: 'amber' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 group">
                  View full history
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="space-y-6">
                {recentActivities.length > 0 ? recentActivities.map((activity, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                      {activity.icon || <BookOpen className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-gray-900">{activity.title}</h4>
                        <span className="text-xs font-medium text-gray-400 capitalize">{activity.timeAgo}</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{activity.author}</p>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${activity.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500">No recent activity yet. Start reading!</p>
                  </div>
                )}
              </div>
            </section>

            {/* Favorite Resources */}
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Saved for Later</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favorites.length > 0 ? favorites.map((fav, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-300 group hover:bg-blue-50/30">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-rose-50 text-rose-500 rounded-lg group-hover:scale-110 transition-transform">
                        <Heart className="w-4 h-4 fill-current" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        {fav.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">{fav.title}</h4>
                    <p className="text-xs text-gray-500 mb-4">{fav.author}</p>
                    <button className="w-full py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300">
                      Access Resource
                    </button>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12">
                     <p className="text-gray-500">You haven't saved any books yet.</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Achievement Badge */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Award className="w-32 h-32" />
              </div>
              <div className="relative z-10 text-white">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold mb-2">
                  {achievements.unlocked > 0 
                    ? achievements.list[0]?.name || 'Achievement Hunter'
                    : 'Start Your Journey'
                  }
                </h3>
                <p className="text-blue-100/70 text-sm mb-6 leading-relaxed">
                  {achievements.unlocked > 0 
                    ? `You've earned ${achievements.unlocked} achievement${achievements.unlocked > 1 ? 's' : ''} and ${achievements.points} points!`
                    : 'Complete actions to unlock achievements and earn points!'
                  }
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="text-blue-200">Progress</span>
                    <span>{achievements.total > 0 ? Math.round((achievements.unlocked / achievements.total) * 100) : 0}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full transition-all duration-500" 
                      style={{ width: `${achievements.total > 0 ? (achievements.unlocked / achievements.total) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-blue-200 text-center mt-2">
                    {achievements.unlocked}/{achievements.total} achievements unlocked
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="flex flex-col gap-3">
                <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all text-sm font-semibold text-gray-600 hover:text-blue-600 text-left">
                  <UserCircle className="w-4 h-4" />
                  Update Profile Photo
                </button>
                <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all text-sm font-semibold text-gray-600 hover:text-blue-600 text-left">
                  <Mail className="w-4 h-4" />
                  Contact Librarian
                </button>
                <button onClick={() => window.open('/Dashboard/Settings', '_self')} className="flex items-center gap-3 p-4 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all text-sm font-semibold text-gray-600 hover:text-blue-600 text-left">
                  <Settings className="w-4 h-4" />
                  Manage Account
                </button>
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-emerald-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-emerald-200">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3">Need Assistance?</h3>
              <p className="text-emerald-50 text-sm mb-6 leading-relaxed">
                Our support team is here to help with any platform or resource issues.
              </p>
              <button onClick={() => window.open('/Dashboard/Support', '_self')} className="w-full py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg">
                Submit Support Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Icon Components
const TargetIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default Profile