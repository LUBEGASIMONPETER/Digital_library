import React from 'react'

const DashboardOverview = () => {
  // Mock data for the student
  const studentData = {
    name: "Alice Mwanga",
    school: "Kawempe High School",
    level: "A-Level Science",
    joinDate: "Jan 2024",
    readingStreak: 14,
    totalBooksRead: 23,
    currentBorrowed: 3,
    studyHours: 42
  }

  const recentActivities = [
    { 
      id: 1, 
      type: 'borrowed', 
      book: 'Advanced Physics Textbook', 
      time: '2 hours ago',
      icon: '📚'
    },
    { 
      id: 2, 
      type: 'completed', 
      book: 'Chemistry Past Papers 2023', 
      time: '1 day ago',
      icon: '✅'
    },
    { 
      id: 3, 
      type: 'downloaded', 
      book: 'Biology Study Guide', 
      time: '2 days ago',
      icon: '📥'
    },
    { 
      id: 4, 
      type: 'renewed', 
      book: 'Mathematics Workbook', 
      time: '3 days ago',
      icon: '🔄'
    }
  ]

  const quickStats = [
    {
      title: "Reading Streak",
      value: `${studentData.readingStreak} days`,
      description: "Keep it up! 🔥",
      color: "from-green-500 to-emerald-600",
      icon: "📅"
    },
    {
      title: "Books Read",
      value: studentData.totalBooksRead,
      description: "This semester",
      color: "from-blue-500 to-cyan-600",
      icon: "📖"
    },
    {
      title: "Study Hours",
      value: `${studentData.studyHours}h`,
      description: "Total learning time",
      color: "from-purple-500 to-indigo-600",
      icon: "⏰"
    },
    {
      title: "Current Loans",
      value: studentData.currentBorrowed,
      description: "Books borrowed",
      color: "from-orange-500 to-red-600",
      icon: "📚"
    }
  ]

  const subjects = [
    { name: "Physics", progress: 75, color: "bg-blue-500" },
    { name: "Chemistry", progress: 60, color: "bg-green-500" },
    { name: "Mathematics", progress: 85, color: "bg-purple-500" },
    { name: "Biology", progress: 45, color: "bg-teal-500" }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100">
              Continue your learning journey at {studentData.school}. You've studied for {studentData.studyHours} hours this month!
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-3 bg-white/20 rounded-xl p-4">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center text-lg">
              🎓
            </div>
            <div>
              <p className="font-semibold">{studentData.level}</p>
              <p className="text-sm text-blue-100">Member since {studentData.joinDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                {stat.icon}
              </div>
              <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{stat.title}</h3>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress by Subject */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Subject Progress</h3>
              <span className="text-sm text-blue-600 font-medium">This Semester</span>
            </div>
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                    <span className="text-sm text-gray-500">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${subject.color} transition-all duration-500`}
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 group">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-lg group-hover:scale-110 transition-transform duration-200">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 font-medium">
                      {activity.type === 'borrowed' && `Borrowed "${activity.book}"`}
                      {activity.type === 'completed' && `Completed "${activity.book}"`}
                      {activity.type === 'downloaded' && `Downloaded "${activity.book}"`}
                      {activity.type === 'renewed' && `Renewed "${activity.book}"`}
                    </p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activity.type === 'borrowed' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'completed' ? 'bg-green-100 text-green-700' :
                    activity.type === 'downloaded' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {activity.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Quick Actions & Achievements */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors duration-200 group">
                <span className="text-lg">📚</span>
                <span className="font-medium">Browse Library</span>
                <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button className="w-full flex items-center space-x-3 border border-gray-300 py-3 px-4 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                <span className="text-lg">📖</span>
                <span className="font-medium text-gray-700">Continue Reading</span>
                <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button className="w-full flex items-center space-x-3 border border-gray-300 py-3 px-4 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                <span className="text-lg">🎯</span>
                <span className="font-medium text-gray-700">Set Study Goals</span>
                <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-green-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Achievements</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: "🔥", name: "Streak Master", earned: true },
                { icon: "📚", name: "Book Worm", earned: true },
                { icon: "⏰", name: "Dedicated", earned: true },
                { icon: "🌟", name: "Top Reader", earned: false },
                { icon: "🚀", name: "Fast Learner", earned: false },
                { icon: "🎓", name: "Scholar", earned: false }
              ].map((achievement, index) => (
                <div key={index} className={`text-center p-3 rounded-xl border-2 transition-all duration-200 ${
                  achievement.earned 
                    ? 'border-yellow-400 bg-yellow-50' 
                    : 'border-gray-200 bg-gray-50 opacity-50'
                }`}>
                  <div className="text-2xl mb-1">{achievement.icon}</div>
                  <p className="text-xs font-medium text-gray-700">{achievement.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Study Tips */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-3">Study Tip 💡</h3>
            <p className="text-green-100 text-sm leading-relaxed">
              "Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break. This can improve your concentration and retention!"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview