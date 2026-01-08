import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import {
  BookOpen,
  Clock,
  TrendingUp,
  Download,
  Award,
  Target,
  BarChart3,
  Calendar,
  Star,
  Zap,
  Trophy,
  ChevronRight,
  BookMarked,
  FileText,
  Library,
  CheckCircle,
  Eye,
  Lightbulb,
  Heart,
  Flame,
  Shield,
  Crown,
  Sparkles,
  GraduationCap,
  Compass,
  Brain,
  Medal,
  Anchor,
  Moon,
  UserPlus
} from 'lucide-react'

// Helper function to map icon string to component
const getAchievementIcon = (iconName) => {
  const iconMap = {
    'trophy': <Trophy className="w-5 h-5" />,
    'user-plus': <UserPlus className="w-5 h-5" />,
    'download': <Download className="w-5 h-5" />,
    'book-open': <BookOpen className="w-5 h-5" />,
    'heart': <Heart className="w-5 h-5" />,
    'book': <BookOpen className="w-5 h-5" />,
    'graduation-cap': <GraduationCap className="w-5 h-5" />,
    'crown': <Crown className="w-5 h-5" />,
    'sparkles': <Sparkles className="w-5 h-5" />,
    'flame': <Flame className="w-5 h-5" />,
    'shield': <Shield className="w-5 h-5" />,
    'star': <Star className="w-5 h-5" />,
    'medal': <Medal className="w-5 h-5" />,
    'moon': <Moon className="w-5 h-5" />,
    'clock': <Clock className="w-5 h-5" />,
    'compass': <Compass className="w-5 h-5" />,
    'brain': <Brain className="w-5 h-5" />,
    'anchor': <Anchor className="w-5 h-5" />,
    'library': <Library className="w-5 h-5" />,
    'archive': <FileText className="w-5 h-5" />,
    'sword': <Target className="w-5 h-5" />,
    'castle': <Award className="w-5 h-5" />
  }
  return iconMap[iconName] || <Trophy className="w-5 h-5" />
}

const DashboardOverview = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [achievementStats, setAchievementStats] = useState({ unlocked: 0, total: 0 })

  useEffect(() => {
    let mounted = true
    const fetchData = async () => {
      try {
        const [statsRes, achievementsRes] = await Promise.all([
          apiFetch('/api/users/dashboard-stats'),
          apiFetch('/api/users/achievements')
        ])
        
        if (statsRes.ok && mounted) {
          const json = await statsRes.json()
          setData(json)
        }
        
        if (achievementsRes.ok && mounted) {
          const achData = await achievementsRes.json()
          // Take first 6 achievements for the overview grid
          const displayAchievements = (achData.achievements || []).slice(0, 6).map(a => ({
            icon: getAchievementIcon(a.icon),
            name: a.name,
            earned: a.unlocked
          }))
          setAchievements(displayAchievements)
          setAchievementStats({
            unlocked: achData.stats?.unlockedCount || 0,
            total: achData.stats?.totalCount || 0
          })
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchData()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const studentData = data?.user || {
    name: "User",
    school: "Kawempe High School",
    level: "Student",
    joinDate: new Date()
  }

  const stats = data?.stats || {
    readingStreak: 0,
    totalBooksRead: 0,
    studyHours: 0,
    downloadedResources: 0,
    subjectProgress: [],
    recentActivity: []
  }

  const recentActivities = stats.recentActivity.map((activity, idx) => ({ 
    ...activity,
    icon: activity.type === 'downloaded' ? <Download className="w-4 h-4" /> : 
          activity.type === 'completed' ? <CheckCircle className="w-4 h-4" /> :
          <Eye className="w-4 h-4" />
  }))

  const quickStats = [
    {
      title: "Reading Streak",
      value: `${stats.readingStreak} days`,
      description: "Keep it going!",
      icon: <TrendingUp className="w-5 h-5" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Resources Read",
      value: stats.totalBooksRead,
      description: "This semester",
      icon: <BookOpen className="w-5 h-5" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Study Hours",
      value: `${stats.studyHours}h`,
      description: "Total learning time",
      icon: <Clock className="w-5 h-5" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    },
    {
      title: "Downloads",
      value: stats.downloadedResources,
      description: "Resources downloaded",
      icon: <Download className="w-5 h-5" />,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600"
    }
  ]

  const subjects = stats.subjectProgress.map(s => ({
    ...s,
    icon: <BookOpen className="w-4 h-4" />
  }))

  const studyTips = [
    "Try the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.",
    "Review past papers regularly to familiarize yourself with exam patterns.",
    "Take notes while reading to improve retention by up to 50%.",
    "Teach what you've learned to someone else - it solidifies your understanding."
  ]

  const getRandomTip = () => studyTips[Math.floor(Math.random() * studyTips.length)]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Welcome back, {studentData.name}! 👋</h2>
            <p className="text-blue-100 text-sm">
              Continue your learning journey at {studentData.school}. You've studied for {stats.studyHours} hours this month!
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-sm">{studentData.level || 'Member'}</p>
              <p className="text-xs text-blue-100">Member since {new Date(studentData.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow duration-200">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <div className={stat.iconColor}>
                  {stat.icon}
                </div>
              </div>
              <span className="text-xl font-semibold text-gray-900">{stat.value}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">{stat.title}</h3>
            <p className="text-xs text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Progress & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subject Progress */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Subject Progress</h3>
                <p className="text-sm text-gray-500 mt-1">This semester's reading progress</p>
              </div>
              <button 
                onClick={() => navigate('/dashboard/library')}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                View details
              </button>
            </div>
            <div className="space-y-4">
              {subjects.map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-600">
                        {subject.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{subject.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{subject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-500"
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500 mt-1">Your latest interactions</p>
              </div>
              <span className="text-sm text-blue-600 font-medium hover:text-blue-700 cursor-pointer">
                See all
              </span>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors duration-150 group">
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                    {activity.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.type === 'downloaded' && `Downloaded "${activity.book}"`}
                      {activity.type === 'completed' && `Completed "${activity.book}"`}
                      {activity.type === 'viewed' && `Viewed "${activity.book}"`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                    activity.type === 'downloaded' ? 'bg-blue-100 text-blue-700' :
                    activity.type === 'completed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {activity.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Actions & Achievements */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/dashboard/library')}
                className="w-full flex items-center gap-3 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 group"
              >
                <Library className="w-4 h-4" />
                <span className="font-medium text-sm">Browse Library</span>
                <ChevronRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/library')}
                className="w-full flex items-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <BookOpen className="w-4 h-4" />
                <span className="font-medium text-sm">Continue Reading</span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
              
              <button 
                onClick={() => navigate('/dashboard/settings')}
                className="w-full flex items-center gap-3 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
              >
                <Target className="w-4 h-4" />
                <span className="font-medium text-sm">Set Study Goals</span>
                <ChevronRight className="w-4 h-4 ml-auto text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Achievements</h3>
              <span className="text-xs text-blue-600 font-medium">
                {achievementStats.unlocked}/{achievementStats.total} earned
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {achievements.length > 0 ? achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    achievement.earned 
                      ? 'border-blue-200 bg-blue-50 hover:bg-blue-100' 
                      : 'border-gray-200 bg-gray-50 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${achievement.earned ? 'text-blue-600' : 'text-gray-400'}`}>
                      {achievement.icon}
                    </div>
                    {achievement.earned && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-700">{achievement.name}</p>
                </div>
              )) : (
                <div className="col-span-2 text-center py-4 text-gray-500 text-sm">
                  No achievements yet. Start exploring!
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/dashboard/achievements')}
              className="w-full mt-4 text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1"
            >
              View All Achievements
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Study Tip */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
                <Lightbulb className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Study Tip</h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              "{getRandomTip()}"
            </p>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">Upcoming</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Mock Exams</p>
                  <p className="text-xs text-gray-500">Next week</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Study Group</p>
                  <p className="text-xs text-gray-500">Friday, 2 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Custom Icons
const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const EyeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
)

const LightbulbIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
)

export default DashboardOverview