import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiFetch } from '../lib/api'
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  Database,
  Server,
  HardDrive,
  Shield,
  Download,
  Eye,
  CheckCircle,
  Calendar,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const AdminHome = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    stats: {
      totalUsers: 0,
      totalDownloads: 0,
      totalBooksRead: 0,
      availableBooks: 0,
      totalStudyHours: 0,
      todayVisits: 0,
      userGrowth: 12
    },
    recentActivity: [],
    systemStatus: []
  })

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const res = await apiFetch('/api/admin/dashboard-stats')
      if (res.ok) {
        const result = await res.json()
        
        setData({
          stats: {
            totalUsers: result.stats.totalUsers,
            totalDownloads: result.stats.totalDownloads || 0,
            totalBooksRead: result.stats.totalBooksRead || 0,
            availableBooks: result.stats.totalBooks,
            totalStudyHours: result.stats.totalStudyHours || 0,
            todayVisits: result.stats.todayVisits,
            userGrowth: result.stats.userGrowth
          },
          recentActivity: [
            ...(result.recentUsers || []).map(u => ({
              id: `u-${u._id}`,
              user: u.name,
              action: 'joined',
              book: '',
              time: u.createdAt,
              type: 'info',
              icon: Users
            })),
            ...(result.recentBooks || []).map(b => ({
              id: `b-${b._id}`,
              user: 'System',
              action: 'added book',
              book: b.title,
              time: b.createdAt,
              type: 'success',
              icon: BookOpen
            })),
            ...(result.recentActivities || []).map(a => ({
              id: `a-${a._id}`,
              user: a.user?.name || 'User',
              action: a.type === 'download' ? 'downloaded' : 'read',
              book: a.book?.title || 'a book',
              time: a.createdAt,
              type: a.type === 'download' ? 'success' : 'info',
              icon: a.type === 'download' ? Download : Eye
            }))
          ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8),
          systemStatus: [
            { name: 'API Server', status: result.systemStatus.api, icon: Server, color: 'bg-green-500' },
            { name: 'Database', status: result.systemStatus.database, icon: Database, color: 'bg-green-500' },
            { name: 'Storage', status: result.systemStatus.storage, icon: HardDrive, color: 'bg-green-500' },
            { name: 'Uploads', status: result.systemStatus.uploads, icon: Activity, color: 'bg-green-500' }
          ]
        })
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const statsData = data.stats
  const recentActivity = data.recentActivity
  const systemStatus = data.systemStatus

  const quickActions = [
    { title: 'Add New Book', description: 'Add to catalog', icon: Plus, color: 'bg-blue-50', hoverColor: 'hover:bg-blue-100', path: '/admin/books' },
    { title: 'Manage Users', description: 'User management', icon: Users, color: 'bg-green-50', hoverColor: 'hover:bg-green-100', path: '/admin/users' },
    { title: 'View Reports', description: 'Analytics & insights', icon: BarChart3, color: 'bg-amber-50', hoverColor: 'hover:bg-amber-100', path: '/admin/reports' },
    { title: 'System Settings', description: 'Configuration', icon: Settings, color: 'bg-purple-50', hoverColor: 'hover:bg-purple-100', path: '/admin/settings' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
              <AdminEmailBadge />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 hidden md:block">
                Last updated: {loading ? 'Refreshing...' : 'Just now'}
              </div>
              <button 
                onClick={fetchDashboardData}
                disabled={loading}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshIcon />
                {loading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        {loading && !data.stats.totalUsers ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            <StatCard 
              title="Total Users"
              value={statsData.totalUsers.toLocaleString()}
              change={`+${statsData.userGrowth}%`}
              trend="up"
              icon={<Users className="w-6 h-6" />}
              description="Real-time member count"
              color="bg-blue-50"
              iconColor="text-blue-600"
            />

            <StatCard 
              title="Available Books"
              value={statsData.availableBooks.toLocaleString()}
              change="Library"
              trend="neutral"
              icon={<Database className="w-6 h-6" />}
              description="Unique titles"
              color="bg-amber-50"
              iconColor="text-amber-600"
            />

            <StatCard 
              title="Total Downloads"
              value={statsData.totalDownloads.toLocaleString()}
              change="All time"
              trend="up"
              icon={<Download className="w-6 h-6" />}
              description="User downloads"
              color="bg-green-50"
              iconColor="text-green-600"
            />

            <StatCard 
              title="Books Read"
              value={statsData.totalBooksRead.toLocaleString()}
              change="All time"
              trend="up"
              icon={<BookOpen className="w-6 h-6" />}
              description="Reading activity"
              color="bg-purple-50"
              iconColor="text-purple-600"
            />

            <StatCard 
              title="Study Hours"
              value={`${statsData.totalStudyHours}h`}
              change="Total"
              trend="up"
              icon={<Clock className="w-6 h-6" />}
              description="User study time"
              color="bg-cyan-50"
              iconColor="text-cyan-600"
            />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-500 mt-1">Latest system activities</p>
              </div>
              <button className="text-sm text-gray-700 hover:text-gray-900 font-medium flex items-center gap-1">
                View All
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'success' ? 'bg-green-50 text-green-600' :
                      activity.type === 'info' ? 'bg-blue-50 text-blue-600' :
                      activity.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.user} <span className="font-normal text-gray-600">{activity.action}</span> {activity.book && `"${activity.book}"`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(activity.time).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(activity.time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'info' ? 'bg-blue-500' :
                      activity.type === 'warning' ? 'bg-amber-500' :
                      'bg-red-500'
                    }`}></div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                return (
                  <button 
                    key={index}
                    onClick={() => navigate(action.path)}
                    className={`p-4 ${action.color} ${action.hoverColor} rounded-xl transition-colors duration-150 text-left group`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${action.color.replace('50', '100')} group-hover:${action.color.replace('50', '200')}`}>
                        <Icon className={`w-5 h-5 ${
                          action.color.includes('blue') ? 'text-blue-600' :
                          action.color.includes('green') ? 'text-green-600' :
                          action.color.includes('amber') ? 'text-amber-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{action.title}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{action.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              <p className="text-sm text-gray-500 mt-1">Real-time system monitoring</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">All systems operational</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {systemStatus.map((status, index) => {
              const Icon = status.icon
              return (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className={`p-2 rounded-lg ${status.color === 'bg-amber-500' ? 'bg-amber-100' : 'bg-green-100'}`}>
                    <Icon className={`w-4 h-4 ${status.color === 'bg-amber-500' ? 'text-amber-600' : 'text-green-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{status.name}</p>
                    <p className="text-sm text-gray-600">{status.status}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                </div>
              )
            })}
          </div>
        </div>

        
      </div>
    </div>
  )
}

// Helper Components
function StatCard({ title, value, change, trend, icon, description, color, iconColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-green-100 text-green-700' :
          trend === 'warning' ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {change}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <div className="text-xl font-semibold text-gray-900 mb-1">{value}</div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

function MetricCard({ title, value, change, trend, description, icon }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-gray-50">
          {icon}
        </div>
        <div className="flex items-center gap-1">
          {trend === 'up' ? (
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-green-700' : 'text-red-700'
          }`}>
            {change}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
      <div className="text-lg font-semibold text-gray-900 mb-1">{value}</div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  )
}

function AdminEmailBadge() {
  const { user } = useAuth()
  const email = user?.email || ''
  const isDev = import.meta.env?.DEV

  if (!email && !isDev) return null

  return (
    <div className="mt-3 flex items-center gap-3 flex-wrap">
      {email && (
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          Signed in as <span className="font-medium text-gray-700">{email}</span>
        </div>
      )}
      {isDev && (
        <div className="text-xs px-2 py-1 bg-amber-100 text-amber-800 rounded-lg border border-amber-200 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Development mode
        </div>
      )}
    </div>
  )
}

export default AdminHome