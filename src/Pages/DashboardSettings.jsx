import React, { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { useToast } from '../Components/Notifications/ToastProvider'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Lock, 
  Bell, 
  ShieldCheck, 
  Camera, 
  ChevronRight,
  RefreshCw,
  Save,
  LogOut,
  Mail,
  School
} from 'lucide-react'

const DashboardSettings = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const { user: authUser, setUser, signOut } = useAuth()
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    school: '',
    role: 'Member',
    bio: '',
    level: 'Student',
    avatarUrl: ''
  })

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    reminders: true,
    marketing: false
  })

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const { add: addToast } = useToast()

  const handleProfileChange = (key, value) => setProfile(p => ({ ...p, [key]: value }))
  const toggleNotification = (key) => setNotifications(n => ({ ...n, [key]: !n[key] }))

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await apiFetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName: profile.fullName, 
          email: profile.email, 
          school: profile.school,
          bio: profile.bio,
          level: profile.level,
          notificationPreferences: notifications
        })
      })
      if (res.ok) {
        const data = await res.json()
        const updated = data.user
        addToast({ message: 'Settings updated successfully', type: 'success' })
        
        // Sync with Auth Context
        if (setUser && updated) {
           setUser(prev => ({ 
             ...prev, 
             name: updated.name,
             email: updated.email,
             schoolName: updated.schoolName,
             bio: updated.bio,
             level: updated.level,
             avatarUrl: updated.avatarUrl,
             notificationPreferences: updated.notificationPreferences
           }))
        }
      } else {
        const errData = await res.json().catch(() => ({}))
        addToast({ message: errData.message || 'Failed to update settings', type: 'error' })
      }
    } catch (err) {
      console.error('Update settings error:', err)
      addToast({ message: 'Network error occurred', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('avatar', file)

    setSaving(true)
    try {
      const res = await apiFetch('/api/users/avatar', {
        method: 'POST',
        body: formData
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(p => ({ ...p, avatarUrl: data.avatarUrl }))
        if (setUser) setUser(prev => ({ ...prev, avatarUrl: data.avatarUrl }))
        addToast({ message: 'Avatar updated successfully', type: 'success' })
      } else {
        const err = await res.json()
        addToast({ message: err.message || 'Avatar upload failed', type: 'error' })
      }
    } catch (err) {
      console.error('Avatar upload error:', err)
      addToast({ message: 'Network error occurred', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) {
      return addToast({ message: 'Passwords do not match', type: 'error' })
    }
    setSaving(true)
    try {
      const res = await apiFetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: passwords.current, newPassword: passwords.newPass })
      })
      if (res.ok) {
        setPasswords({ current: '', newPass: '', confirm: '' })
        addToast({ message: 'Password changed successfully', type: 'success' })
      } else {
        const errData = await res.json().catch(() => ({}))
        addToast({ message: errData.message || 'Password change failed', type: 'error' })
      }
    } catch (err) {
      addToast({ message: 'Network error occurred', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiFetch('/api/users/me')
        if (res.ok) {
          const data = await res.json()
          const user = data.user || data
          setProfile({
            fullName: user.name || user.fullName || '',
            email: user.email || '',
            school: user.schoolName || user.school || '',
            role: user.role || 'Member',
            bio: user.bio || '',
            level: user.level || 'Student',
            avatarUrl: user.avatarUrl || ''
          })
          if (user.notificationPreferences) {
            setNotifications(user.notificationPreferences)
          }
        }
      } catch (err) {
        console.error('Fetch profile error:', err)
      }
    }
    fetchProfile()
  }, [])

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
          <p className="text-gray-500 font-medium">Manage your digital library identity and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation */}
          <div className="lg:col-span-1 space-y-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'text-gray-600 hover:bg-white hover:text-blue-600 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                  {tab.label}
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
              </button>
            ))}
            <div className="pt-6 mt-6 border-t border-gray-100">
               <button 
                 onClick={signOut}
                 className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-600 font-bold text-sm hover:bg-red-50 transition-all duration-200"
               >
                 <LogOut className="w-5 h-5" />
                 Sign Out
               </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-8 mb-10 relative">
                    <div className="relative group cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-24 h-24 rounded-3xl bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center text-blue-400 group-hover:border-blue-600 transition-all duration-300 overflow-hidden">
                        {profile.avatarUrl ? (
                          <img 
                            src={profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${import.meta.env.VITE_BACKEND_URL || ''}${profile.avatarUrl}`} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <Camera className="w-10 h-10 group-hover:scale-110 transition-transform" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white">
                        <RefreshCw className={`w-4 h-4 ${saving ? 'animate-spin' : ''}`} />
                      </div>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-black text-gray-900 leading-tight">
                        {profile.fullName || 'New Member'}
                      </h3>
                      <div className="flex items-center justify-center md:justify-start gap-2 mt-1">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                          {profile.role}
                        </span>
                        <span className="text-sm font-medium text-gray-400">
                          {profile.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <input 
                            type="text" 
                            value={profile.fullName}
                            placeholder="Enter your full name"
                            onChange={(e) => handleProfileChange('fullName', e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input 
                            type="email" 
                            disabled
                            value={profile.email}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-100 border border-transparent rounded-2xl text-sm font-medium text-gray-500 cursor-not-allowed opacity-75"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Academic Level</label>
                        <select 
                          value={profile.level}
                          onChange={(e) => handleProfileChange('level', e.target.value)}
                          className="w-full px-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        >
                          <option value="Student">Student</option>
                          <option value="A-Level Student">A-Level Student</option>
                          <option value="O-Level Student">O-Level Student</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Researcher">Researcher</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">School / Institution</label>
                        <div className="relative group">
                          <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                          <input 
                            type="text" 
                            value={profile.school}
                            placeholder="Your school name"
                            onChange={(e) => handleProfileChange('school', e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Short Bio</label>
                      <textarea 
                        rows="3"
                        value={profile.bio}
                        placeholder="Tell us about your learning goals..."
                        onChange={(e) => handleProfileChange('bio', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none"
                      />
                    </div>

                    <div className="flex justify-end pt-6">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
                      >
                        {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-red-50 rounded-2xl">
                      <ShieldCheck className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Security Settings</h3>
                      <p className="text-sm font-medium text-gray-500">Keep your account safe and secure</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={passwords.current}
                        onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))}
                        className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                        <input 
                          type="password"
                          placeholder="Min. 8 characters"
                          value={passwords.newPass}
                          onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                        <input 
                          type="password"
                          placeholder="Confirm new password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                          className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end pt-6">
                      <button 
                        type="submit"
                        disabled={saving}
                        className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
                      >
                        {saving ? 'Updating Security...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                      <Bell className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Notifications</h3>
                      <p className="text-sm font-medium text-gray-500">Choose how we contact you</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[
                      { id: 'email', label: 'Email Alerts', desc: 'Resource updates and library announcements.' },
                      { id: 'sms', label: 'SMS Alerts', desc: 'Urgent notices sent to your phone.' },
                      { id: 'reminders', label: 'Study Reminders', desc: 'Daily nudges to keep your streak alive.' },
                    ].map(item => (
                      <div key={item.id} className="flex items-center justify-between p-5 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                        <div>
                          <p className="text-sm font-black text-gray-900">{item.label}</p>
                          <p className="text-xs font-medium text-gray-500 mt-1">{item.desc}</p>
                        </div>
                        <button 
                          onClick={() => toggleNotification(item.id)}
                          className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.id] ? 'bg-blue-600' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${notifications[item.id] ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardSettings
