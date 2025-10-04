import React from 'react'

const DashboardHome = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 shadow"> 
          <h4 className="text-lg font-semibold">Quick Stats</h4>
          <p className="text-sm text-gray-500">Overview of your activity.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow"> 
          <h4 className="text-lg font-semibold">My Library</h4>
          <p className="text-sm text-gray-500">Books you've saved.</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow"> 
          <h4 className="text-lg font-semibold">Support</h4>
          <p className="text-sm text-gray-500">Contact support or view tickets.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow">
        <h3 className="text-xl font-bold mb-3">Recent Activity</h3>
        <p className="text-gray-600">No recent activity yet. Start exploring the library!</p>
      </div>
    </div>
  )
}

export default DashboardHome
