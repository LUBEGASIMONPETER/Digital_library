import React, { useState } from 'react'

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

  const handleProfileChange = (key, value) => setProfile(p => ({ ...p, [key]: value }))
  const toggleNotification = (key) => setNotifications(n => ({ ...n, [key]: !n[key] }))

  const handleSave = (e) => {
    e.preventDefault()
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      alert('Settings saved (mock)')
    }, 700)
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) return alert('New passwords do not match')
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setPasswords({ current: '', newPass: '', confirm: '' })
      alert('Password updated (mock)')
    }, 700)
  }

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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
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
        </div>

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
