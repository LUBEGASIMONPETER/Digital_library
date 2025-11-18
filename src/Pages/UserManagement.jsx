import React, { useState, useEffect } from 'react'
import { useToast } from '../Components/Notifications/ToastProvider'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'

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
  const { user: authUser } = useAuth()
  const { add: addToast } = useToast()

  // Mock data - replace with actual API call
  useEffect(() => {
    const fetchUsers = async () => {
      try {
  const res = await apiFetch('/api/admin/users')
        if (!res.ok) {
          throw new Error('Failed to fetch users')
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
          booksBorrowed: u.booksBorrowed || 0,
          avatar: u.avatar || ''
        }))

        // By default we hide admin accounts from the management list so admins don't edit each other.
        // However the seeded development admin (created by the backend at startup) should be able
        // to see all users (including other admins). Detect that seeded admin by email and
        // allow the full list for that user.
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
        // fallback to empty list
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
  // unban/reactivate use the same server action (sets status -> active)
  const handleUnbanUser = (user) => openActionModal('unban', user)
  const handleReactivateUser = (user) => openActionModal('reactivate', user)

  const performAction = async () => {
    if (!actionUser || !actionType) return
    setActionProcessing(true)
    try {
      if (actionType === 'ban') {
        const res = await fetch(`/api/admin/users/${actionUser.id}/ban`, {
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
        const res = await fetch(`/api/admin/users/${actionUser.id}/suspend`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ until: untilIso.toISOString(), reason: actionReason, adminName: authUser?.email || authUser?.name || 'Administrator' })
        })
        if (!res.ok) throw new Error('Failed to suspend user')
        const body = await res.json()
        setUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'suspended', suspendedUntil: body.user.suspendedUntil } : u))
        setFilteredUsers(prev => prev.map(u => u.id === actionUser.id ? { ...u, status: 'suspended', suspendedUntil: body.user.suspendedUntil } : u))
      } else if (actionType === 'delete') {
        const res = await fetch(`/api/admin/users/${actionUser.id}`, {
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
        // unsuspend, unban and reactivate all set the account back to active
        const res = await fetch(`/api/admin/users/${actionUser.id}/unsuspend`, {
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

  // Change user status
  const changeUserStatus = (userId, newStatus) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, status: newStatus } : user
    ))
  }

  // Change user role
  const changeUserRole = (userId, newRole) => {
    // capture previous role for revert
    const prevRole = users.find(u => u.id === userId)?.role || 'member'
    // optimistic update then persist to backend
    setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user))
    // fire-and-forget async update
    ;(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: newRole })
        })
        if (!res.ok) {
          throw new Error('Failed to update role')
        }
        const body = await res.json()
        // update with any normalized role from server
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: body.user.role } : u))
        addToast({ message: `Role updated to ${body.user.role}`, type: 'success' })
      } catch (err) {
        console.error('Role update failed', err)
        // revert optimistic update
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

    const fields = ['Name', 'Email', 'Role', 'Status', 'Join Date', 'Books Borrowed']
    const rows = dataToExport.map(u => ([
      u.name,
      u.email,
      u.role,
      u.status,
      u.joinDate ? new Date(u.joinDate).toLocaleString() : '',
      u.booksBorrowed || 0
    ]))

    setExporting(true)
    setExportMessage('Preparing export...')

    try {
      if (format === 'excel') {
        // Dynamically import SheetJS only when needed (avoids bundler issues)
        const mod = await import('xlsx')
        const XLSX = mod && (mod.default || mod)

        // Build a worksheet from an array-of-arrays so each field maps to its own cell
        const ws_data = [fields, ...rows]
        const ws = XLSX.utils.aoa_to_sheet(ws_data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Users')

        // Write workbook to binary array
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
        const blob = new Blob([wbout], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        const now = new Date().toISOString().slice(0,10)
        a.href = url
        a.download = `dl-users-${now}.xlsx`
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
        a.download = `dl-users-${now}.csv`
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
      // keep a short success message then clear
      setTimeout(() => {
        setExporting(false)
        setExportMessage('')
      }, 1500)
      setShowExportMenu(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
        {/* Export toast / progress */}
        {exporting && (
          <div className="fixed right-6 bottom-6 z-50">
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg shadow flex items-center gap-3">
              <div className="w-5 h-5 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm text-gray-800">{exportMessage || 'Exporting...'}</div>
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage library members and staff accounts</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Link
            to="/admin/users/invite"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Invite User
          </Link>
        </div>
      </div>

      {/* Tabs: All / Deleted */}
      <div className="flex items-center gap-3">
          <Link to="/admin/users" className="px-4 py-2 rounded-lg bg-indigo-600 text-white">All users</Link>
          <Link to="/admin/users/deleted" className="px-4 py-2 rounded-lg bg-gray-100">Deleted users</Link>
      </div>

      

      {/* Stats Cards */}

      {/* compute metrics */}
      {(() => {
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
        const suspendedPrev = suspendedUsers // fallback (accurate tracking requires historical data)
        const pctSuspended = 2 // keep small static fallback or you can compute if you store historical statuses

        const pctNew = Math.round(((newThisMonth - prevMonthNew) / (prevMonthNew || 1)) * 100)

        // expose as locals for JSX below via closure
        ;
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={totalUsers}
              change={`${pctTotal >= 0 ? '+' : ''}${pctTotal}%`}
              trend={pctTotal >= 0 ? 'up' : 'down'}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor"><path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" /><path fillRule="evenodd" d="M2 13.5A4.5 4.5 0 016.5 9h7A4.5 4.5 0 0118 13.5V15a1 1 0 01-1 1H3a1 1 0 01-1-1v-1.5z" clipRule="evenodd" /></svg>}
            />
            <StatCard
              title="Active Users"
              value={activeUsers}
              change={`${pctActive >= 0 ? '+' : ''}${pctActive}%`}
              trend={pctActive >= 0 ? 'up' : 'down'}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 10-1.414 1.414L9 13.414l4.707-4.707z" clipRule="evenodd"/></svg>}
            />
            <StatCard
              title="New This Month"
              value={newThisMonth}
              change={`${pctNew >= 0 ? '+' : ''}${pctNew}%`}
              trend={pctNew >= 0 ? 'up' : 'down'}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1.07A7.002 7.002 0 004 11H3a1 1 0 100 2h1a7 7 0 0014 0h1a1 1 0 100-2h-1a7.002 7.002 0 00-5-6.93V3z"/></svg>}
            />
            <StatCard
              title="Suspended"
              value={suspendedUsers}
              change={`${pctSuspended >= 0 ? '+' : ''}${pctSuspended}%`}
              trend={pctSuspended >= 0 ? 'up' : 'down'}
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 002 0V7zm0 5a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd"/></svg>}
            />
          </div>
        )
      })()}
      

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
            >
              <option value="all">All Roles</option>
              <option value="member">Member</option>
              <option value="librarian">Librarian</option>
              <option value="admin">Admin</option>
            </select>

            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export
              </button>

              {showExportMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                  <button
                    onClick={() => exportData('csv')}
                    disabled={exporting}
                    className={`flex items-center w-full px-4 py-2 text-sm ${exporting ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'} transition-colors duration-200`}
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => exportData('excel')}
                    disabled={exporting}
                    className={`flex items-center w-full px-4 py-2 text-sm ${exporting ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'} transition-colors duration-200`}
                  >
                    Export as Excel
                  </button>
                  <button
                    onClick={() => exportData('pdf')}
                    disabled={exporting}
                    className={`flex items-center w-full px-4 py-2 text-sm ${exporting ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'} transition-colors duration-200`}
                  >
                    Export as PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

  {/* Users Table */}
  <div className="overflow-visible rounded-xl border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Join Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Books</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  selected={selectedUsers.includes(user.id)}
                  onSelect={handleUserSelect}
                  onDelete={handleDeleteUser}
                  onChangeStatus={changeUserStatus}
                  onChangeRole={changeUserRole}
                  onBan={handleBanUser}
                  onSuspend={handleSuspendUser}
                  onUnsuspend={handleUnsuspendUser}
                  onUnban={handleUnbanUser}
                  onReactivate={handleReactivateUser}
                />
              ))}
            </tbody>
          </table>

          {currentUsers.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No users found</p>
              <p className="text-gray-400 mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-gray-700">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Next
              </button>
            </div>
          </div>
        )}
        </div>

      {/* Action Modal (ban / suspend / delete) */}
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
    </div>
  )
}

// User Row Component
const UserRow = ({ user, selected, onSelect, onDelete, onChangeStatus, onChangeRole, onBan, onSuspend, onUnsuspend, onUnban, onReactivate }) => {
  const [showActions, setShowActions] = useState(false)

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(user.id)}
          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
        />
      </td>
      
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold mr-4">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </td>
      
      <td className="px-6 py-4">
        <select
          value={user.role}
          onChange={(e) => onChangeRole(user.id, e.target.value)}
          className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
        >
          <option value="member">Member</option>
          <option value="librarian">Librarian</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          user.status === 'active' ? 'bg-green-100 text-green-800' :
          user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-red-100 text-red-800'
        }`}>
          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
        </span>
      </td>
      
      <td className="px-6 py-4 text-sm text-gray-900">
        {new Date(user.joinDate).toLocaleDateString()}
      </td>
      
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {user.booksBorrowed} books
        </span>
      </td>
      
      <td className="px-6 py-4">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="inline-flex items-center p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
            </svg>
          </button>

          {showActions && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                View Profile
              </button>
              
              {user.status === 'suspended' ? (
                <button onClick={() => onUnsuspend && onUnsuspend(user)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unsuspend
                </button>
              ) : (
                <button onClick={() => onSuspend && onSuspend(user)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                  </svg>
                  Suspend
                </button>
              )}

              <button onClick={() => onBan && onBan(user)} className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Ban / Deactivate
              </button>
              {(user.status === 'banned') ? (
                <button onClick={() => onUnban && onUnban(user)} className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-50 transition-colors duration-200">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unban / Reactivate
                </button>
              ) : (user.status === 'inactive') ? (
                <button onClick={() => onReactivate && onReactivate(user)} className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-gray-50 transition-colors duration-200">
                  <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Reactivate
                </button>
              ) : null}
              <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit User
              </button>
              
              <button 
                onClick={() => onDelete(user)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
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
const StatCard = ({ title, value, change, trend, icon }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        <p className={`text-sm font-medium mt-1 ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {change} from last month
        </p>
      </div>
      <div className="text-3xl">{icon}</div>
    </div>
  </div>
)

// Action modal used for ban / suspend / delete with reason input
const ActionModal = ({ type, user, reason, until, processing, onChangeReason, onChangeUntil, onCancel, onConfirm }) => {
  const title = type === 'ban' ? 'Deactivate User' : type === 'suspend' ? 'Suspend User' : type === 'unsuspend' ? 'Unsuspend User' : type === 'unban' ? 'Unban User' : type === 'reactivate' ? 'Reactivate User' : 'Delete User'
  const confirmLabel = type === 'ban' ? 'Deactivate' : type === 'suspend' ? 'Suspend' : type === 'unsuspend' ? 'Unsuspend' : type === 'unban' ? 'Unban' : type === 'reactivate' ? 'Reactivate' : 'Delete User'
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-4 mx-auto">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1 4v1m0-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-gray-600 text-center mb-4">{user ? `${user.name} — ${user.email}` : ''}</p>

        {type === 'suspend' && (
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-2">Suspend until</label>
            <input type="date" value={until || ''} onChange={(e) => onChangeUntil(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm text-gray-700 mb-2">Reason (required)</label>
          <textarea value={reason || ''} onChange={(e) => onChangeReason(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Explain why this action is being taken"></textarea>
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={processing} className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium">Cancel</button>
          <button onClick={onConfirm} disabled={processing || (type === 'suspend' && !until) || !reason.trim()} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors duration-200 font-medium">{processing ? 'Processing...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default UserManagement