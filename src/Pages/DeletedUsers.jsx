import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { apiFetch } from '../lib/api'

const DeletedUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)
  const { user: authUser } = useAuth()

  useEffect(() => {
    const fetchDeleted = async () => {
      try {
  const res = await apiFetch('/api/admin/users?includeDeleted=true')
        if (!res.ok) throw new Error('Failed to fetch deleted users')
        const body = await res.json()
        // filter only deleted records
        const deleted = (body.users || []).filter(u => u.isDeleted)
        setUsers(deleted)
      } catch (err) {
        console.error(err)
        setUsers([])
      } finally {
        setLoading(false)
      }
    }
    fetchDeleted()
  }, [])

  const openRestoreModal = (user) => {
    setSelectedUser(user)
    setReason('')
    setShowModal(true)
  }

  const performRestore = async () => {
    if (!selectedUser) return
    setProcessing(true)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}/restore`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, adminName: authUser?.email || authUser?.name || 'Administrator' })
      })
      if (!res.ok) throw new Error('Failed to restore user')
      const body = await res.json()
      // remove from local list
      setUsers(prev => prev.filter(u => u.id !== selectedUser.id))
      setShowModal(false)
      setSelectedUser(null)
    } catch (err) {
      console.error(err)
      alert('Restore failed')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Deleted Users</h1>
          <p className="text-gray-600">List of soft-deleted users. You can restore accounts from here.</p>
        </div>
        <div>
          <Link to="/admin/users" className="px-4 py-2 bg-gray-100 rounded-lg">Back to Users</Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No deleted users found</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deleted At</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deleted By</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Reason</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4">{u.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm">{u.deletedAt ? new Date(u.deletedAt).toLocaleString() : '-'}</td>
                    <td className="px-6 py-4 text-sm">{u.deletedBy || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{u.deletedReason || '-'}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openRestoreModal(u)} className="px-3 py-2 bg-green-600 text-white rounded-lg">Restore</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold">Restore account</h3>
            <p className="text-sm text-gray-600 mt-2">You are restoring <strong>{selectedUser.name}</strong> ({selectedUser.email}). Optionally provide a reason.</p>

            <div className="mt-4">
              <label className="block text-sm text-gray-700 mb-1">Reason (optional)</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={() => { setShowModal(false); setSelectedUser(null) }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
              <button onClick={performRestore} disabled={processing} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">{processing ? 'Restoring...' : 'Restore'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DeletedUsers
