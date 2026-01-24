import React, { useState, useEffect, useRef } from 'react'
import { useToast } from '../Components/Notifications/ToastProvider'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'
import {
  Users,
  UserPlus,
  Search,
  Download,
  MoreVertical,
  User,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  RefreshCw,
  Eye,
  Ban,
  PauseCircle,
  PlayCircle,
  Mail,
  Calendar,
  FileText,
  FileSpreadsheet,
  File
} from 'lucide-react'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)

  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportMessage, setExportMessage] = useState('')
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState('') // 'ban' | 'suspend' | 'delete'
  const [actionUser, setActionUser] = useState(null)
  const [actionReason, setActionReason] = useState('')
  const [actionUntil, setActionUntil] = useState('') // YYYY-MM-DD
  const [actionProcessing, setActionProcessing] = useState(false)
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editUser, setEditUser] = useState(null)

  const handleViewUser = (user) => {
    setEditUser(user)
    setShowViewModal(true)
  }
  
  const { user: authUser } = useAuth()
  const { add: addToast } = useToast()
  const exportMenuRef = useRef(null)

  // Close export menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFetch('/api/admin/users')
        if (!res.ok) {
          let msg = `status ${res.status}`
          try {
            const body = await res.json()
            if (body && body.message) msg = `${msg} - ${body.message}`
          } catch (e) {}
          throw new Error('Failed to fetch users: ' + msg)
        }
        const data = await res.json()
        const usersFromApi = (data.users || []).map(u => ({
          id: u.id,
          name: u.name || 'Unknown',
          email: u.email,
          role: u.role || 'member',
          status: u.status || 'inactive',
          joinDate: u.joinDate || new Date().toISOString(),
          lastLogin: u.lastLogin || null,
          avatar: u.avatar || ''
        }))

        const SEED_ADMIN_EMAIL = 'dlibrarymanagement@gmail.com'
        const isSeededAdmin = !!(authUser && authUser.email && String(authUser.email).toLowerCase() === SEED_ADMIN_EMAIL)

        const usersToShow = isSeededAdmin
          ? usersFromApi
          : usersFromApi.filter(u => (u.role || 'member').toLowerCase() !== 'admin')

        setUsers(usersToShow)
        setFilteredUsers(usersToShow)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching users:', error)
        setUsers([])
        setFilteredUsers([])
        setLoading(false)
      }
    }

    fetchUsers()
  }, [authUser])

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchTerm, statusFilter, roleFilter, users])

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser)
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)

  // Select all users on current page
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const currentPageUserIds = currentUsers.map(user => user.id)
      setSelectedUsers(currentPageUserIds)
    } else {
      setSelectedUsers([])
    }
  }

  // Handle individual user selection
  const handleUserSelect = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Open action modal for delete/ban/suspend
  const openActionModal = (type, user) => {
    setActionType(type)
    setActionUser(user)
    setActionReason('')
    setActionUntil('')
    setShowActionModal(true)
  }

  // wrappers used by UserRow
  const handleDeleteUser = (user) => openActionModal('delete', user)
  const handleBanUser = (user) => openActionModal('ban', user)
  const handleSuspendUser = (user) => openActionModal('suspend', user)
  const handleUnsuspendUser = (user) => openActionModal('unsuspend', user)
  const handleUnbanUser = (user) => openActionModal('unban', user)
  const handleReactivateUser = (user) => openActionModal('reactivate', user)

  const handleEditSubmit = async (formData) => {
    if (!editUser) return
    try {
      // In a real app we'd have a specific PUT /api/admin/users/:id endpoint
      // for general updates. For now we use the general user update logic if available
      // or just simulate the UI update since we don't have a specific bulk-edit endpoint.
      // But let's assume we can update name and role.
      const res = await apiFetch(`/api/admin/users/${editUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: formData.role })
      })
      
      if (!res.ok) throw new Error('Failed to update user')
      
      const body = await res.json()
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, name: formData.name, role: body.user.role } : u))
      addToast({ message: 'User updated successfully', type: 'success' })
      setShowEditModal(false)
      setEditUser(null)
    } catch (err) {
      console.error('Update failed', err)
      addToast({ message: 'Failed to update user', type: 'error' })
    }
  }

  const performAction = async () => {
    if (!actionUser || !actionType) return
    setActionProcessing(true)
    try {
      if (actionType === 'ban') {
        const res = await apiFetch(`/api/admin/users/${actionUser.id}/ban`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: actionReason, adminName: authUser?.email || authUser?.name || 'Administrator' })
        })
        if (!res.ok) throw new Error('Failed to ban user')
        await res.json()
        setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'banned' } : u))
        setFilteredUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'banned' } : u))
      } else if (actionType === 'suspend') {
        if (!actionUntil) return alert('Please pick a suspension end date')
        const untilIso = new Date(actionUntil)
        untilIso.setHours(23,59,59,999)
        const res = await apiFetch(`/api/admin/users/${actionUser.id}/suspend`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ until: untilIso.toISOString(), reason: actionReason, adminName: authUser?.email || authUser?.name || 'Administrator' })
        })
        if (!res.ok) throw new Error('Failed to suspend user')
        const body = await res.json()
        setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'suspended', suspendedUntil: body.user.suspendedUntil } : u))
        setFilteredUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'suspended', suspendedUntil: body.user.suspendedUntil } : u))
      } else if (actionType === 'delete') {
        const res = await apiFetch(`/api/admin/users/${actionUser.id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: actionReason, adminName: authUser?.email || authUser?.name || 'Administrator' })
        })
        if (!res.ok) throw new Error('Failed to delete user')
        await res.json()
        setUsers(prev => prev.filter(u => u.id !== actionUser.id))
        setFilteredUsers(prev => prev.filter(u => u.id !== actionUser.id))
        setSelectedUsers(prev => prev.filter(id => id !== actionUser.id))
      } else if (actionType === 'unsuspend' || actionType === 'unban' || actionType === 'reactivate') {
        const res = await apiFetch(`/api/admin/users/${actionUser.id}/unsuspend`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: actionReason, adminName: authUser?.email || authUser?.name || 'Administrator' })
        })
        if (!res.ok) throw new Error('Failed to unsuspend/reactivate user')
        const body = await res.json()
        setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'active', suspendedUntil: null } : u))
        setFilteredUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'active', suspendedUntil: null } : u))
      }
    } catch (err) {
      console.error(err)
      alert('Operation failed')
    } finally {
      setActionProcessing(false)
      setShowActionModal(false)
      setActionUser(null)
      setActionType('')
    }
  }

  // Change user role
  const changeUserRole = (userId, newRole) => {
    const prevRole = users.find(u => u.id === userId)?.role || 'member'
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user))
    ;(async () => {
      try {
        const res = await apiFetch(`/api/admin/users/${userId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        })
        if (!res.ok) {
          throw new Error('Failed to update role')
        }
        const body = await res.json()
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: body.user.role } : u))
        addToast({ message: `Role updated to ${body.user.role}`, type: 'success' })
      } catch (err) {
        console.error('Role update failed', err)
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: prevRole } : u))
        addToast({ message: 'Failed to update role', type: 'error' })
      }
    })()
  }

  // Export data (CSV / XLSX / PDF)
  const exportData = async (format) => {
    const dataToExport = selectedUsers.length > 0 
      ? users.filter(user => selectedUsers.includes(user.id))
      : filteredUsers

    const fields = ['Name', 'Email', 'Role', 'Status', 'Join Date']
    const rows = dataToExport.map(u => ([
      u.name,
      u.email,
      u.role,
      u.status,
      u.joinDate ? new Date(u.joinDate).toLocaleString() : ''
    ]))

    setExporting(true)
    setExportMessage('Preparing export...')

    try {
      if (format === 'excel') {
        const mod = await import('xlsx')
        const XLSX = mod && (mod.default || mod)

        const ws_data = [fields, ...rows]
        const ws = XLSX.utils.aoa_to_sheet(ws_data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Users')

        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([wbout], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const now = new Date().toISOString().slice(0,10)
        a.href = url
        a.download = `users-export-${now}.xlsx`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        setExportMessage('Excel export complete')
      } else if (format === 'csv') {
        const escape = (v) => {
          if (v === null || v === undefined) return ''
          const s = String(v)
          if (s.includes('"')) return `"${s.replace(/"/g, '""')}"`
          if (s.includes(',') || s.includes('\n') || s.includes('\r')) return `"${s}"`
          return s
        }
        const csv = [fields.join(','), ...rows.map(r => r.map(escape).join(','))].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const now = new Date().toISOString().slice(0,10)
        a.href = url
        a.download = `users-export-${now}.csv`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        setExportMessage('CSV export complete')
      } else if (format === 'pdf') {
        const htmlRows = rows.map(r => `<tr>${r.map(c => `<td style="padding:8px;border:1px solid #ddd">${String(c || '')}</td>`).join('')}</tr>`).join('')
        const html = `<!doctype html><html><head><meta charset="utf-8"><title>Users export</title><style>body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f7fafc}</style></head><body><h2>Exported users</h2><table><thead><tr>${fields.map(f=>`<th style="padding:8px;border:1px solid #ddd">${f}</th>`).join('')}</tr></thead><tbody>${htmlRows}</tbody></table></body></html>`
        const win = window.open('', '_blank')
        if (!win) {
          alert('Please allow popups to export PDF')
          return
        }
        win.document.open()
        win.document.write(html)
        win.document.close()
        setTimeout(() => {
          win.focus()
          win.print()
        }, 250)
        setExportMessage('PDF export started')
      }
    } catch (err) {
      console.error('Export error:', err)
      setExportMessage('Export failed')
    } finally {
      setTimeout(() => {
        setExporting(false)
        setExportMessage('')
      }, 1500)
      setShowExportMenu(false)
    }
  }

  // Compute stats
  const computeStats = () => {
    const now = Date.now()
    const MS_PER_DAY = 24 * 60 * 60 * 1000
    const start30 = new Date(now - 30 * MS_PER_DAY)
    const start60 = new Date(now - 60 * MS_PER_DAY)

    const parseJoin = (u) => u.joinDate ? new Date(u.joinDate) : null

    const newThisMonth = users.filter(u => {
      const d = parseJoin(u)
      return d && d >= start30
    }).length

    const prevMonthNew = users.filter(u => {
      const d = parseJoin(u)
      return d && d >= start60 && d < start30
    }).length

    const totalUsers = users.length
    const totalPrev = totalUsers - newThisMonth
    const pctTotal = Math.round((newThisMonth / (totalPrev || 1)) * 100)

    const activeUsers = users.filter(u => u.status === 'active').length
    const activeNewThisMonth = users.filter(u => u.status === 'active' && (() => { const d = parseJoin(u); return d && d >= start30 })()).length
    const activePrev = Math.max(activeUsers - activeNewThisMonth, 0)
    const pctActive = Math.round((activeNewThisMonth / (activePrev || 1)) * 100)

    const suspendedUsers = users.filter(u => u.status === 'suspended').length
    const pctSuspended = 2

    const pctNew = Math.round(((newThisMonth - prevMonthNew) / (prevMonthNew || 1)) * 100)

    return {
      totalUsers,
      activeUsers,
      newThisMonth,
      suspendedUsers,
      pctTotal,
      pctActive,
      pctNew,
      pctSuspended
    }
  }

  const stats = computeStats()

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-12 h-12 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading users...</p>
          </div>
        </div>
        {exporting && (
          <div className="fixed right-6 bottom-6 z-50">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm font-medium text-gray-800">{exportMessage || 'Exporting...'}</div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage library members and staff accounts</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {selectedUsers.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-200">
              <span className="text-sm font-medium text-gray-600 mr-2">
                {selectedUsers.length} selected:
              </span>
              <button
                onClick={() => {
                  const first = users.find(u => u.id === selectedUsers[0]);
                  openActionModal('suspend', first);
                }}
                className="inline-flex items-center px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
              >
                <PauseCircle className="w-4 h-4 mr-1.5" />
                Suspend
              </button>
              <button
                onClick={() => {
                  const first = users.find(u => u.id === selectedUsers[0]);
                  openActionModal('delete', first);
                }}
                className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium px-2 py-1"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <Link 
          to="/admin/users" 
          className="px-4 py-2 rounded-lg bg-gray-800 text-white font-medium"
        >
          All users
        </Link>
        <Link 
          to="/admin/users/deleted" 
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
        >
          Deleted users
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          change={`${stats.pctTotal >= 0 ? '+' : ''}${stats.pctTotal}%`}
          trend={stats.pctTotal >= 0 ? 'up' : 'down'}
          icon={<Users className="w-5 h-5" />}
          iconColor="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          change={`${stats.pctActive >= 0 ? '+' : ''}${stats.pctActive}%`}
          trend={stats.pctActive >= 0 ? 'up' : 'down'}
          icon={<CheckCircle className="w-5 h-5" />}
          iconColor="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          title="New This Month"
          value={stats.newThisMonth}
          change={`${stats.pctNew >= 0 ? '+' : ''}${stats.pctNew}%`}
          trend={stats.pctNew >= 0 ? 'up' : 'down'}
          icon={<Clock className="w-5 h-5" />}
          iconColor="text-amber-600"
          bgColor="bg-amber-50"
        />
        <StatCard
          title="Suspended"
          value={stats.suspendedUsers}
          change={`${stats.pctSuspended >= 0 ? '+' : ''}${stats.pctSuspended}%`}
          trend={stats.pctSuspended >= 0 ? 'up' : 'down'}
          icon={<AlertCircle className="w-5 h-5" />}
          iconColor="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors duration-200"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors duration-200 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors duration-200 appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="member">Member</option>
                <option value="librarian">Librarian</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200 font-medium"
                disabled={exporting}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => exportData('csv')}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    disabled={exporting}
                  >
                    <FileText className="w-4 h-4 mr-3 text-gray-400" />
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportData('excel')}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    disabled={exporting}
                  >
                    <FileSpreadsheet className="w-4 h-4 mr-3 text-gray-400" />
                    Export as Excel
                  </button>
                  <button
                    onClick={() => exportData('pdf')}
                    className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    disabled={exporting}
                  >
                    <File className="w-4 h-4 mr-3 text-gray-400" />
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto sm:overflow-visible">
            <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="pl-6 pr-3 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-gray-800 rounded focus:ring-gray-800 focus:ring-offset-0"
                  />
                </th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Join Date</th>
                <th className="px-3 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user, index) => (
                <UserRow
                  key={user.id}
                  user={user}
                  index={index}
                  totalInPage={currentUsers.length}
                  selected={selectedUsers.includes(user.id)}
                  onSelect={handleUserSelect}
                  onDelete={handleDeleteUser}
                  onChangeRole={changeUserRole}
                  onBan={handleBanUser}
                  onSuspend={handleSuspendUser}
                  onUnsuspend={handleUnsuspendUser}
                  onUnban={handleUnbanUser}
                  onReactivate={handleReactivateUser}
                  onEdit={() => { setEditUser(user); setShowEditModal(true); }}
                  onView={() => handleViewUser(user)}
                />
              ))}
            </tbody>
          </table>

          {currentUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
            <p className="text-sm text-gray-700">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                if (pageNum < 1 || pageNum > totalPages) return null

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-gray-800 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <ActionModal
          type={actionType}
          user={actionUser}
          reason={actionReason}
          until={actionUntil}
          processing={actionProcessing}
          onChangeReason={(v) => setActionReason(v)}
          onChangeUntil={(v) => setActionUntil(v)}
          onCancel={() => { setShowActionModal(false); setActionUser(null); setActionType('') }}
          onConfirm={performAction}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && editUser && (
        <EditUserModal
          user={editUser}
          onCancel={() => { setShowEditModal(false); setEditUser(null); }}
          onConfirm={handleEditSubmit}
        />
      )}

      {/* View Profile Modal */}
      {showViewModal && editUser && (
        <ViewProfileModal
          user={editUser}
          onClose={() => { setShowViewModal(false); setEditUser(null); }}
        />
      )}
    </div>
  )
}

// User Row Component
const UserRow = ({ user, index, totalInPage, selected, onSelect, onDelete, onChangeRole, onBan, onSuspend, onUnsuspend, onUnban, onReactivate, onEdit, onView }) => {
  const [showActions, setShowActions] = useState(false)
  const actionsRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'inactive': return <Clock className="w-4 h-4 text-gray-400" />
      case 'suspended': return <PauseCircle className="w-4 h-4 text-amber-500" />
      case 'banned': return <Ban className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-amber-100 text-amber-800'
      case 'banned': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Determine if dropdown should open upwards (near the bottom of the visible list)
  const openUpwards = totalInPage >= 3 && index >= totalInPage - 2

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="pl-6 pr-3 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user.id)}
          className="w-4 h-4 text-gray-800 rounded focus:ring-gray-800 focus:ring-offset-0"
        />
      </td>
      
      <td className="px-3 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-semibold mr-3">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="w-3 h-3" />
              {user.email}
            </p>
          </div>
        </div>
      </td>
      
      <td className="px-3 py-4">
        <select
          value={user.role}
          onChange={(e) => onChangeRole(user.id, e.target.value)}
          className="text-sm bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors duration-200"
        >
          <option value="member">Member</option>
          <option value="librarian">Librarian</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      
      <td className="px-3 py-4 text-sm text-gray-900 flex items-center gap-2 whitespace-nowrap">
        <Calendar className="w-4 h-4 text-gray-400" />
        {new Date(user.joinDate).toLocaleDateString()}
      </td>
      
      <td className="px-3 py-4">
        <div className="relative" ref={actionsRef}>
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>

          {showActions && (
            <div className={`absolute right-0 ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'} w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] animate-in fade-in zoom-in-95 duration-100`}>
              <button 
                onClick={() => { onView && onView(user); setShowActions(false); }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <Eye className="w-4 h-4 mr-3 text-gray-400" />
                View Profile
              </button>
              
              <button 
                onClick={() => { onEdit && onEdit(user); setShowActions(false); }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <Edit2 className="w-4 h-4 mr-3 text-gray-400" />
                Edit User
              </button>
              
              {user.status === 'suspended' ? (
                <button onClick={() => { onUnsuspend && onUnsuspend(user); setShowActions(false); }} className="flex items-center w-full px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors duration-200">
                  <PlayCircle className="w-4 h-4 mr-3 text-green-500" />
                  Unsuspend
                </button>
              ) : (
                <button onClick={() => { onSuspend && onSuspend(user); setShowActions(false); }} className="flex items-center w-full px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors duration-200">
                  <PauseCircle className="w-4 h-4 mr-3 text-amber-500" />
                  Suspend
                </button>
              )}

              {user.status === 'banned' ? (
                <button onClick={() => { onUnban && onUnban(user); setShowActions(false); }} className="flex items-center w-full px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors duration-200">
                  <PlayCircle className="w-4 h-4 mr-3 text-green-500" />
                  Unban
                </button>
              ) : user.status === 'inactive' ? (
                <button onClick={() => { onReactivate && onReactivate(user); setShowActions(false); }} className="flex items-center w-full px-4 py-2.5 text-sm text-green-700 hover:bg-green-50 transition-colors duration-200">
                  <PlayCircle className="w-4 h-4 mr-3 text-green-500" />
                  Reactivate
                </button>
              ) : (
                <button onClick={() => { onBan && onBan(user); setShowActions(false); }} className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  <Ban className="w-4 h-4 mr-3 text-gray-400" />
                  Ban / Deactivate
                </button>
              )}
              
              <button 
                onClick={() => { onDelete && onDelete(user); setShowActions(false); }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors duration-200"
              >
                <Trash2 className="w-4 h-4 mr-3 text-red-500" />
                Delete User
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

// Stat Card Component
const StatCard = ({ title, value, change, trend, icon, iconColor, bgColor }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-4">
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2 rounded-lg ${bgColor}`}>
        <div className={iconColor}>
          {icon}
        </div>
      </div>
      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
        trend === 'up' ? 'bg-green-100 text-green-700' :
        'bg-red-100 text-red-700'
      }`}>
        {change}
      </span>
    </div>
    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
    <div className="text-xl font-semibold text-gray-900">{value.toLocaleString()}</div>
  </div>
)

// Action modal used for ban / suspend / delete with reason input
const ActionModal = ({ type, user, reason, until, processing, onChangeReason, onChangeUntil, onCancel, onConfirm }) => {
  const title = type === 'ban' ? 'Deactivate User' : type === 'suspend' ? 'Suspend User' : type === 'unsuspend' ? 'Unsuspend User' : type === 'unban' ? 'Unban User' : type === 'reactivate' ? 'Reactivate User' : 'Delete User'
  const confirmLabel = type === 'ban' ? 'Deactivate' : type === 'suspend' ? 'Suspend' : type === 'unsuspend' ? 'Unsuspend' : type === 'unban' ? 'Unban' : type === 'reactivate' ? 'Reactivate' : 'Delete User'
  const Icon = type === 'ban' || type === 'delete' ? AlertCircle : type === 'suspend' ? PauseCircle : type === 'unsuspend' || type === 'unban' || type === 'reactivate' ? PlayCircle : AlertCircle

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${
            type === 'delete' ? 'bg-red-100 text-red-600' :
            type === 'ban' ? 'bg-amber-100 text-amber-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">Confirm this action</p>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium text-gray-900">{user?.name || ''}</p>
          <p className="text-sm text-gray-500">{user?.email || ''}</p>
        </div>

        {type === 'suspend' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Suspend until</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="date" 
                value={until || ''} 
                onChange={(e) => onChangeUntil(e.target.value)} 
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
              />
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason (required)</label>
          <textarea 
            value={reason || ''} 
            onChange={(e) => onChangeReason(e.target.value)} 
            rows={3} 
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 resize-none"
            placeholder="Explain why this action is being taken"
          />
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            disabled={processing} 
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            disabled={processing || (type === 'suspend' && !until) || !reason.trim()} 
            className={`flex-1 px-4 py-2.5 rounded-lg transition-colors duration-200 font-medium ${
              type === 'delete' 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : type === 'ban' 
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-800 text-white hover:bg-gray-900'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {processing ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// Edit User Modal Component
const EditUserModal = ({ user, onCancel, onConfirm }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'member'
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
            <Edit2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
            <p className="text-sm text-gray-500">Update account information</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              type="email"
              value={formData.email}
              disabled
              className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
            />
            <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed from the admin panel.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800 transition-colors"
            >
              <option value="member">Member</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(formData)}
            className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// View Profile Modal Component
const ViewProfileModal = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 relative">
            <User className="w-10 h-10" />
            <span className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-white ${
              user.status === 'active' ? 'bg-green-500' : user.status === 'banned' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></span>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <p className="text-gray-500 capitalize">{user.role}</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">Email</span>
            <span className="text-gray-900 font-medium text-sm">{user.email}</span>
          </div>
          {/* <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">Status</span>
            <span className={`text-sm font-semibold capitalize ${
              user.status === 'active' ? 'text-green-600' : 'text-red-600'
            }`}>{user.status}</span>
          </div> */}
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500 text-sm">Joined Date</span>
            <span className="text-gray-900 font-medium text-sm">
              {new Date(user.joinDate || user.joinedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-semibold"
        >
          Close Preview
        </button>
      </div>
    </div>
  )
}

export default UserManagement