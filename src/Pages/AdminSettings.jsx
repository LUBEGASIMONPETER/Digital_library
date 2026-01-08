import React, { useState } from 'react'
import { 
  Settings, 
  Shield, 
  Globe, 
  Bell, 
  Database, 
  Mail, 
  Cloud,
  Save,
  RefreshCw,
  Image,
  Server,
  Lock,
  ChevronRight
} from 'lucide-react'
import { useToast } from '../Components/Notifications/ToastProvider'

const AdminSettings = () => {
  const { add: addToast } = useToast()
  const [activeTab, setActiveTab] = useState('general')
  const [saving, setSaving] = useState(false)
  
  const [settings, setSettings] = useState({
    libraryName: 'Digital Library System',
    supportEmail: 'support@dlibrary.ug',
    sessionTimeout: '60',
    allowPublicSignup: true,
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    catalogGridVersion: 'v2',
    enableAuditLogs: true,
    maxBorrowDuration: '14',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: '587',
    backupFrequency: 'daily'
  })

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      addToast({ message: 'System settings updated successfully', type: 'success' })
    }, 1200)
  }

  const SettingGroup = ({ title, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
    </div>
  )

  const Toggle = ({ label, desc, enabled, onToggle }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button 
        onClick={onToggle}
        className={`w-11 h-6 rounded-full transition-colors relative ${enabled ? 'bg-gray-900' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  )

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'email', label: 'Email Config', icon: Mail },
    { id: 'database', label: 'Backup & Storage', icon: Database },
  ]

  return (
    <div className="min-h-screen bg-gray-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">System Configuration</h1>
            <p className="text-sm text-gray-500 mt-1">Manage global library parameters and security</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-1">
            {tabs.map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl font-bold text-sm transition-all ${
                  activeTab === tab.id 
                  ? 'bg-gray-900 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-white hover:shadow-sm group'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : 'group-hover:text-gray-900'}`} />
                  {tab.label}
                </div>
                <ChevronRight className={`w-4 h-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-0'}`} />
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'general' && (
              <>
                <SettingGroup title="Identity & Branding">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Library Name</label>
                        <input 
                          type="text" 
                          value={settings.libraryName}
                          onChange={(e) => setSettings({...settings, libraryName: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-800 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Support Email</label>
                        <input 
                          type="email" 
                          value={settings.supportEmail}
                          onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-800 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                        <Image className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">App Logo</p>
                        <p className="text-xs text-blue-700 mb-2">Maximum file size: 2MB. Preferred aspect ratio: 1:1.</p>
                        <button className="text-xs font-black text-blue-600 hover:underline flex items-center gap-1 uppercase tracking-tight">
                          Update Logo <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </SettingGroup>

                <SettingGroup title="Resource Policies">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Max Borrow Duration (Days)</label>
                      <input 
                        type="number" 
                        value={settings.maxBorrowDuration}
                        onChange={(e) => setSettings({...settings, maxBorrowDuration: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-800 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Catalog Display</label>
                      <select 
                        value={settings.catalogGridVersion}
                        onChange={(e) => setSettings({...settings, catalogGridVersion: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-gray-800 outline-none transition-all"
                      >
                        <option value="v1">Standard Grid</option>
                        <option value="v2">Responsive Cards (New)</option>
                        <option value="v3">List View</option>
                      </select>
                    </div>
                  </div>
                </SettingGroup>

                <SettingGroup title="Preferences">
                  <Toggle 
                    label="Allow Public Signups" 
                    desc="When enabled, anyone can create an account via the landing page."
                    enabled={settings.allowPublicSignup}
                    onToggle={() => setSettings({...settings, allowPublicSignup: !settings.allowPublicSignup})}
                  />
                  <div className="h-px bg-gray-100 my-2" />
                  <Toggle 
                    label="Maintenance Mode" 
                    desc="Restrict access to the platform for regular users during updates."
                    enabled={settings.maintenanceMode}
                    onToggle={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                  />
                  <div className="h-px bg-gray-100 my-2" />
                  <Toggle 
                    label="Email Notifications" 
                    desc="Send automated receipts and welcome emails."
                    enabled={settings.emailNotifications}
                    onToggle={() => setSettings({...settings, emailNotifications: !settings.emailNotifications})}
                  />
                </SettingGroup>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <SettingGroup title="Access Control">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Session Timeout</p>
                      <p className="text-xs text-gray-500">Minutes until inactive users are logged out</p>
                    </div>
                    <select 
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-gray-800 outline-none transition-all"
                    >
                      <option value="30">30 Min</option>
                      <option value="60">1 Hour</option>
                      <option value="240">4 Hours</option>
                      <option value="0">Never</option>
                    </select>
                  </div>
                  <div className="h-px bg-gray-100 my-2" />
                  <Toggle 
                    label="Enable Audit Logging" 
                    desc="Record all administrative actions in the system audit trail."
                    enabled={settings.enableAuditLogs}
                    onToggle={() => setSettings({...settings, enableAuditLogs: !settings.enableAuditLogs})}
                  />
                </SettingGroup>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Security Note</h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Changing access policies will invalidate existing user sessions. Users will need to re-authenticate to apply new settings.
                    </p>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'email' && (
              <SettingGroup title="SMTP Configuration">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">SMTP Host</label>
                    <input 
                      type="text" 
                      value={settings.smtpHost}
                      onChange={(e) => setSettings({...settings, smtpHost: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      placeholder="e.g. smtp.gmail.com"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Port</label>
                      <input 
                        type="text" 
                        value={settings.smtpPort}
                        onChange={(e) => setSettings({...settings, smtpPort: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Encryption</label>
                      <select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm">
                        <option>TLS (StartTLS)</option>
                        <option>SSL</option>
                        <option>None</option>
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <button className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-black uppercase text-gray-600 hover:bg-gray-50 transition-all">
                      Send Test Email
                    </button>
                  </div>
                </div>
              </SettingGroup>
            )}

            {activeTab === 'database' && (
              <>
                <SettingGroup title="Backup Schedule">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Auto-Backup Frequency</p>
                      <p className="text-xs text-gray-500">How often to generate full system snapshots</p>
                    </div>
                    <select 
                      value={settings.backupFrequency}
                      onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
                      className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="manual">Manual Only</option>
                    </select>
                  </div>
                  <div className="h-px bg-gray-100 my-2" />
                  <Toggle 
                    label="Automatic Backups" 
                    desc="Enable encrypted off-site backup storage."
                    enabled={settings.autoBackup}
                    onToggle={() => setSettings({...settings, autoBackup: !settings.autoBackup})}
                  />
                </SettingGroup>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Run Manual Backup</p>
                        <p className="text-xs text-gray-500">Trigger an immediate database dump and store it.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all">
                      Execute Now
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const ArrowUpRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 17L17 7M17 7H7M17 7V17" />
  </svg>
)

export default AdminSettings
