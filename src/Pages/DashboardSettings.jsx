import React, { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'
import { useToast } from '../Components/Notifications/ToastProvider'

const DashboardSettings = () => {
  const [profile, setProfile] = useState({
    fullName: 'Alice Mwanga',
    email: 'alice@example.com',
    school: 'Kawempe High School'
  })

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    reminders: true
  })

  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' })
  const [saving, setSaving] = useState(false)
  const { add: addToast } = useToast()

  const handleProfileChange = (key, value) => setProfile(p => ({ ...p, [key]: value }))
  const toggleNotification = (key) => setNotifications(n => ({ ...n, [key]: !n[key] }))

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    ;(async () => {
      try {
        // try to update profile on backend
        const res = await apiFetch('/api/users/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          // backend expects { fullName, email, school }
          body: JSON.stringify({ fullName: profile.fullName, email: profile.email, school: profile.school })
        })
        if (res.ok) {
          setSaving(false)
          addToast({ message: 'Profile updated', type: 'success' })
          // also persist locally
          localStorage.setItem('dl_profile', JSON.stringify(profile))
          return
        }
        // fallback to local save
        console.warn('Profile save responded with', res.status)
      } catch (err) {
        console.warn('Profile save failed, falling back to localStorage', err)
      }

      // fallback: save to localStorage so settings persist in demo
      localStorage.setItem('dl_profile', JSON.stringify(profile))
      setSaving(false)
      addToast({ message: 'Settings saved (local)', type: 'info' })
    })()
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
  if (passwords.newPass !== passwords.confirm) return addToast({ message: 'New passwords do not match', type: 'error' })
    ;(async () => {
      setSaving(true)
      try {
        const res = await apiFetch('/api/users/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current: passwords.current, newPassword: passwords.newPass })
        })
        if (res.ok) {
          setPasswords({ current: '', newPass: '', confirm: '' })
          setSaving(false)
          addToast({ message: 'Password updated', type: 'success' })
          return
        }
        const body = await res.json().catch(() => ({}))
        console.warn('Change password response', res.status, body)
        addToast({ message: body.message || 'Password change failed', type: 'error' })
      } catch (err) {
  console.warn('Change password failed, using mock behavior', err)
  // fallback mock
  setPasswords({ current: '', newPass: '', confirm: '' })
  addToast({ message: 'Password updated (local mock)', type: 'info' })
      } finally {
        setSaving(false)
      }
    })()
  }

  // load profile from backend or localStorage on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
  const res = await apiFetch('/api/users/me')
        if (res.ok) {
          const body = await res.json()
          if (!mounted) return
          // backend may return { user: {...} } or the user directly
          const data = body.user || body
          setProfile(p => ({
            fullName: data.name || data.fullName || p.fullName,
            email: data.email || p.email,
            // backend may return schoolName
            school: data.schoolName || data.school || p.school
          }))
          return
        }
      } catch (err) {
        // ignore and fallback to local
      }

      // fallback: load from localStorage if available
      try {
        const stored = localStorage.getItem('dl_profile')
        if (stored && mounted) setProfile(JSON.parse(stored))
      } catch (err) {}
    })()
    return () => { mounted = false }
  }, [])

  return (
    <div className="min-h-screen bg-gray-50/30 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your account and preferences</p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input value={profile.fullName} onChange={(e) => handleProfileChange('fullName', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input value={profile.email} onChange={(e) => handleProfileChange('email', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">School / Institution</label>
              <input value={profile.school} onChange={(e) => handleProfileChange('school', e.target.value)} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>

        {/* <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Email notifications</p>
                <p className="text-sm text-gray-500">Receive updates and loan reminders by email</p>
              </div>
              <input type="checkbox" checked={notifications.email} onChange={() => toggleNotification('email')} />
            </label>

            <label className="flex items-center justify-between p-3 border rounded-xl">
              <div>
                <p className="font-medium text-gray-900">SMS notifications</p>
                <p className="text-sm text-gray-500">Receive short SMS alerts for due dates</p>
              </div>
              <input type="checkbox" checked={notifications.sms} onChange={() => toggleNotification('sms')} />
            </label>

            <label className="flex items-center justify-between p-3 border rounded-xl">
              <div>
                <p className="font-medium text-gray-900">Reminders</p>
                <p className="text-sm text-gray-500">Daily reminders about your reading list</p>
              </div>
              <input type="checkbox" checked={notifications.reminders} onChange={() => toggleNotification('reminders')} />
            </label>
          </div>
        </div> */}

        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Change password</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Current password</label>
              <input type="password" value={passwords.current} onChange={(e) => setPasswords(p => ({ ...p, current: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">New password</label>
              <input type="password" value={passwords.newPass} onChange={(e) => setPasswords(p => ({ ...p, newPass: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-700 mb-1">Confirm new password</label>
              <input type="password" value={passwords.confirm} onChange={(e) => setPasswords(p => ({ ...p, confirm: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl" />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button type="submit" disabled={saving} className="px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition">
              {saving ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>

        <div className="text-sm text-gray-500">Tip: You can update your profile and preferences here. Changes are saved locally in this demo.</div>
      </div>
    </div>
  )
}

export default DashboardSettings
