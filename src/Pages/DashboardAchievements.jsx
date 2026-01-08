import React, { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { 
  Trophy, 
  Lock, 
  Star, 
  Flame,
  Shield,
  Crown,
  Sparkles,
  BookOpen,
  Download,
  Heart,
  Clock,
  GraduationCap,
  Compass,
  Brain,
  Medal,
  Anchor,
  Library,
  Moon,
  UserPlus,
  Sword,
  Castle,
  Archive
} from 'lucide-react'

const iconMap = {
  'trophy': Trophy,
  'user-plus': UserPlus,
  'download': Download,
  'book-open': BookOpen,
  'heart': Heart,
  'book': BookOpen,
  'graduation-cap': GraduationCap,
  'crown': Crown,
  'sparkles': Sparkles,
  'flame': Flame,
  'shield': Shield,
  'sword': Sword,
  'castle': Castle,
  'archive': Archive,
  'anchor': Anchor,
  'library': Library,
  'star': Star,
  'medal': Medal,
  'moon': Moon,
  'clock': Clock,
  'compass': Compass,
  'brain': Brain
}

const rarityColors = {
  common: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-600', glow: '' },
  uncommon: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-600', glow: '' },
  rare: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-600', glow: 'shadow-blue-200' },
  epic: { bg: 'bg-purple-50', border: 'border-purple-400', text: 'text-purple-600', glow: 'shadow-purple-200' },
  legendary: { bg: 'bg-amber-50', border: 'border-amber-400', text: 'text-amber-600', glow: 'shadow-amber-200' }
}

const categoryLabels = {
  milestone: 'Milestones',
  reading: 'Reading',
  engagement: 'Engagement',
  social: 'Collection',
  special: 'Special'
}

const DashboardAchievements = () => {
  const [achievements, setAchievements] = useState([])
  const [stats, setStats] = useState({ totalPoints: 0, unlockedCount: 0, totalCount: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const res = await apiFetch('/api/users/achievements')
        if (res.ok) {
          const data = await res.json()
          setAchievements(data.achievements || [])
          setStats(data.stats || { totalPoints: 0, unlockedCount: 0, totalCount: 0 })
        }
      } catch (err) {
        console.error('Failed to fetch achievements:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAchievements()
  }, [])

  const filteredAchievements = filter === 'all' 
    ? achievements 
    : filter === 'unlocked' 
      ? achievements.filter(a => a.unlocked)
      : filter === 'locked'
        ? achievements.filter(a => !a.unlocked)
        : achievements.filter(a => a.category === filter)

  const groupedAchievements = filteredAchievements.reduce((acc, ach) => {
    const cat = ach.category || 'milestone'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(ach)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const progressPercent = stats.totalCount > 0 ? Math.round((stats.unlockedCount / stats.totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-7 h-7 text-amber-500" />
            Your Achievements
          </h1>
          <p className="text-gray-500 text-sm">Unlock achievements by exploring and reading books!</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-amber-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <p className="text-amber-100 text-sm font-medium">Total Points</p>
              <p className="text-3xl font-bold">{stats.totalPoints}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Unlocked</p>
              <p className="text-3xl font-bold">{stats.unlockedCount} <span className="text-lg text-blue-200">/ {stats.totalCount}</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Progress</p>
            <p className="text-gray-900 font-bold">{progressPercent}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-gray-500 text-xs mt-2">Keep going to unlock more achievements!</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'unlocked', 'locked', 'milestone', 'reading', 'engagement', 'social', 'special'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f === 'all' ? 'All' : f === 'unlocked' ? 'Unlocked' : f === 'locked' ? 'Locked' : categoryLabels[f] || f}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {Object.keys(groupedAchievements).length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <Lock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No achievements found</h3>
          <p className="text-gray-500">Try a different filter or start exploring the library!</p>
        </div>
      ) : (
        Object.entries(groupedAchievements).map(([category, items]) => (
          <div key={category} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              {categoryLabels[category] || category}
              <span className="text-sm font-normal text-gray-400">({items.length})</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map(achievement => {
                const IconComponent = iconMap[achievement.icon] || Trophy
                const rarity = rarityColors[achievement.rarity] || rarityColors.common
                const isUnlocked = achievement.unlocked

                return (
                  <div 
                    key={achievement.key}
                    className={`relative rounded-2xl border-2 p-5 transition-all duration-300 ${
                      isUnlocked 
                        ? `${rarity.bg} ${rarity.border} shadow-lg ${rarity.glow} hover:scale-[1.02]`
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    {/* Rarity Badge */}
                    <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                      isUnlocked ? `${rarity.text} ${rarity.bg}` : 'text-gray-400 bg-gray-100'
                    }`}>
                      {achievement.rarity}
                    </div>

                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                      isUnlocked 
                        ? `${rarity.bg} ${rarity.text}` 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {isUnlocked ? (
                        <IconComponent className="w-7 h-7" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>

                    {/* Content */}
                    <h3 className={`font-bold text-base mb-1 ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-xs font-medium mb-2 ${isUnlocked ? rarity.text : 'text-gray-400'}`}>
                      {achievement.title}
                    </p>
                    <p className={`text-sm leading-relaxed ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {isUnlocked ? achievement.description : 'Complete the required task to unlock this achievement.'}
                    </p>

                    {/* Points & Date */}
                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className={`w-4 h-4 ${isUnlocked ? 'text-amber-500' : 'text-gray-300'}`} />
                        <span className={`text-sm font-semibold ${isUnlocked ? 'text-amber-600' : 'text-gray-400'}`}>
                          {achievement.points} pts
                        </span>
                      </div>
                      {isUnlocked && achievement.unlockedAt && (
                        <span className="text-xs text-gray-400">
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default DashboardAchievements
