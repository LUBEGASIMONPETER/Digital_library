import React, { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { Trophy, Star, X, Sparkles } from 'lucide-react'

const AchievementContext = createContext(null)

export const useAchievementPopup = () => {
  const context = useContext(AchievementContext)
  if (!context) {
    throw new Error('useAchievementPopup must be used within AchievementPopupProvider')
  }
  return context
}

const rarityGradients = {
  common: 'from-gray-400 to-gray-600',
  uncommon: 'from-green-400 to-green-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-amber-400 to-amber-600'
}

const rarityGlow = {
  common: 'shadow-gray-300',
  uncommon: 'shadow-green-300',
  rare: 'shadow-blue-300',
  epic: 'shadow-purple-300',
  legendary: 'shadow-amber-300'
}

export const AchievementPopupProvider = ({ children }) => {
  const [queue, setQueue] = useState([])
  const [currentAchievement, setCurrentAchievement] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  const showAchievement = useCallback((achievement) => {
    setQueue(prev => [...prev, achievement])
  }, [])

  const showMultipleAchievements = useCallback((achievements) => {
    if (achievements && achievements.length > 0) {
      setQueue(prev => [...prev, ...achievements])
    }
  }, [])

  const dismissCurrent = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setCurrentAchievement(null)
    }, 300)
  }, [])

  // Process queue
  useEffect(() => {
    if (!currentAchievement && queue.length > 0) {
      const [next, ...rest] = queue
      setCurrentAchievement(next)
      setQueue(rest)
      setIsVisible(true)
    }
  }, [queue, currentAchievement])

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (currentAchievement && isVisible) {
      const timer = setTimeout(() => {
        dismissCurrent()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [currentAchievement, isVisible, dismissCurrent])

  return (
    <AchievementContext.Provider value={{ showAchievement, showMultipleAchievements }}>
      {children}
      
      {/* Achievement Popup Modal */}
      {currentAchievement && (
        <div 
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={dismissCurrent}
          />
          
          {/* Modal Content */}
          <div 
            className={`relative bg-white rounded-3xl p-8 max-w-md w-full transform transition-all duration-500 ${
              isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
            } shadow-2xl ${rarityGlow[currentAchievement.rarity] || 'shadow-amber-300'}`}
          >
            {/* Close button */}
            <button 
              onClick={dismissCurrent}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Sparkles decoration */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-amber-400 animate-pulse" />
              </div>
            </div>

            {/* Trophy Icon */}
            <div className="flex justify-center mb-6 mt-4">
              <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${rarityGradients[currentAchievement.rarity] || rarityGradients.common} flex items-center justify-center shadow-lg animate-bounce-slow`}>
                <Trophy className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* Congratulations Text */}
            <div className="text-center">
              <p className="text-sm font-medium text-amber-600 uppercase tracking-wider mb-2">
                🎉 Congratulations! 🎉
              </p>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Achievement Unlocked!
              </h2>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase mb-4 ${
                currentAchievement.rarity === 'legendary' ? 'bg-amber-100 text-amber-700' :
                currentAchievement.rarity === 'epic' ? 'bg-purple-100 text-purple-700' :
                currentAchievement.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                currentAchievement.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {currentAchievement.rarity}
              </div>
            </div>

            {/* Achievement Details */}
            <div className="bg-gray-50 rounded-2xl p-5 mb-6">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-1">
                {currentAchievement.name}
              </h3>
              <p className="text-sm text-blue-600 font-medium text-center mb-3">
                "{currentAchievement.title}"
              </p>
              <p className="text-sm text-gray-600 text-center leading-relaxed">
                {currentAchievement.description}
              </p>
            </div>

            {/* Points Earned */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-lg font-bold text-gray-900">+{currentAchievement.points} Points</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={dismissCurrent}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  dismissCurrent()
                  window.location.href = '/dashboard/achievements'
                }}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
              >
                View All
              </button>
            </div>

            {/* Queue indicator */}
            {queue.length > 0 && (
              <p className="text-center text-xs text-gray-400 mt-4">
                +{queue.length} more achievement{queue.length > 1 ? 's' : ''} unlocked!
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </AchievementContext.Provider>
  )
}

export default AchievementPopupProvider
