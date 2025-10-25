import React from 'react'

const AdminHome = () => {
  // Sample data - in real app, this would come from API
  const statsData = {
    totalUsers: 3421,
    activeLoans: 42,
    pendingTickets: 5,
    availableBooks: 1256,
    revenue: 12560,
    todayVisits: 89
  }

  const recentActivity = [
    { id: 1, user: 'John Doe', action: 'borrowed', book: 'Advanced Physics', time: '2 min ago', type: 'success' },
    { id: 2, user: 'Sarah Smith', action: 'returned', book: 'Calculus I', time: '15 min ago', type: 'info' },
    { id: 3, user: 'Mike Johnson', action: 'renewed', book: 'Modern Chemistry', time: '1 hour ago', type: 'warning' },
    { id: 4, user: 'Emma Wilson', action: 'reported issue', book: 'Computer Science', time: '2 hours ago', type: 'error' },
    { id: 5, user: 'Alex Brown', action: 'registered', book: '', time: '3 hours ago', type: 'info' }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return '📚'
      case 'info': return '🔄'
      case 'warning': return '⚠️'
      case 'error': return '🚨'
      default: return '📝'
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-lg text-gray-600 mt-2">Welcome back! Here's what's happening today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">Last updated: Just now</div>
              <button className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium">
                Refresh Data
              </button>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-2xl p-6  shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${statsData.totalUsers > 3000 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                +12%
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
            <div className="text-2xl font-bold text-gray-900 mb-1">{statsData.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-500">+24 new this week</p>
          </div>

          {/* Active Loans */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📖</span>
              </div>
              <div className={`text-sm font-medium px-2 py-1 rounded-full ${statsData.activeLoans > 40 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                High
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Active Loans</p>
            <div className="text-2xl font-bold text-gray-900 mb-1">{statsData.activeLoans}</div>
            <p className="text-xs text-gray-500">8 due today</p>
          </div>

          
          {/* Available Books */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                Stock
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Available Books</p>
            <div className="text-2xl font-bold text-gray-900 mb-1">{statsData.availableBooks.toLocaleString()}</div>
            <p className="text-xs text-gray-500">98% available</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <div className="text-sm font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                +8%
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Monthly Revenue</p>
            <div className="text-2xl font-bold text-gray-900 mb-1">${statsData.revenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500">From fines & fees</p>
          </div>

          {/* Today's Visits */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">👣</span>
              </div>
              <div className="text-sm font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                Active
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Today's Visits</p>
            <div className="text-2xl font-bold text-gray-900 mb-1">{statsData.todayVisits}</div>
            <p className="text-xs text-gray-500">Peak: 2:00 PM</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl border transition-colors hover:bg-gray-50">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getActivityColor(activity.type)} border`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user} <span className="font-normal text-gray-600">{activity.action}</span> {activity.book && `"${activity.book}"`}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-left group">
                <div className="text-2xl mb-2">➕</div>
                <p className="font-medium text-gray-900">Add New Book</p>
                <p className="text-sm text-gray-600 mt-1">Add to catalog</p>
              </button>
              
              <button className="p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-left group">
                <div className="text-2xl mb-2">👥</div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-600 mt-1">User management</p>
              </button>
              
              <button className="p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-left group">
                <div className="text-2xl mb-2">📊</div>
                <p className="font-medium text-gray-900">View Reports</p>
                <p className="text-sm text-gray-600 mt-1">Analytics & insights</p>
              </button>
              
              <button className="p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-left group">
                <div className="text-2xl mb-2">⚙️</div>
                <p className="font-medium text-gray-900">Settings</p>
                <p className="text-sm text-gray-600 mt-1">System configuration</p>
              </button>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">API Server</p>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Database</p>
                <p className="text-sm text-gray-600">Healthy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Backup</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="font-medium text-gray-900">Storage</p>
                <p className="text-sm text-gray-600">64% used</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminHome