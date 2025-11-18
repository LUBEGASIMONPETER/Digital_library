const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

// dev fallback file (used when MongoDB is not connected)
const DEV_PROFILE_PATH = path.join(__dirname, '..', 'dev_profile.json')

// NOTE: These are development-friendly user endpoints. In production you MUST
// protect these routes with authentication & proper authorization.

// Helper to find a sensible "current" user when no auth system present.
async function findCurrentUser() {
  // prefer explicit admin/email from env for convenience
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const u = await User.findOne({ email: adminEmail })
    if (u) return u
  }
  // fallback: first user in DB
  try {
    const any = await User.findOne({}).sort({ createdAt: 1 })
    return any
  } catch (err) {
    // If DB query fails, fall back to dev_profile.json if present
    try {
      if (fs.existsSync(DEV_PROFILE_PATH)) {
        const raw = fs.readFileSync(DEV_PROFILE_PATH, 'utf8')
        const obj = JSON.parse(raw)
        // return a pseudo-user object compatible with code that uses ._id, .name, etc.
        return { _id: 'dev-local', name: obj.name || obj.fullName || 'Dev User', email: obj.email, schoolName: obj.schoolName || obj.school }
      }
    } catch (e) {
      // ignore
    }
    return null
  }
}

// GET /api/users/me
router.get('/me', async (req, res) => {
  try {
    const user = await findCurrentUser()
    if (!user) return res.status(404).json({ message: 'No user found' })
    const out = {
      id: user._id,
      name: user.name,
      email: user.email,
      schoolName: user.schoolName || '',
      location: user.location || '',
      contact: user.contact || '',
      role: user.role || 'user'
    }
    return res.json({ user: out })
  } catch (err) {
    console.error('GET /api/users/me error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/users/me
router.put('/me', async (req, res) => {
  try {
    // If Mongoose is connected, prefer DB-backed update. Otherwise, fall back to a local dev file.
    const mongooseConnected = mongoose.connection && mongoose.connection.readyState === 1

    const { fullName, name, email, school, schoolName } = req.body || {}
    const resolvedName = fullName !== undefined ? fullName : name
    const resolvedSchool = school !== undefined ? school : schoolName

    if (mongooseConnected) {
      const user = await findCurrentUser()
      if (!user) return res.status(404).json({ message: 'No user found' })

      if (resolvedName !== undefined) user.name = resolvedName
      if (resolvedSchool !== undefined) user.schoolName = resolvedSchool

      if (email !== undefined && email !== user.email) {
        // ensure unique
        const exists = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } })
        if (exists) return res.status(400).json({ message: 'Email already in use' })
        user.email = email.toLowerCase().trim()
      }

      await user.save()
      return res.json({ message: 'Profile updated', user: { id: user._id, name: user.name, email: user.email, schoolName: user.schoolName } })
    }

    // Dev fallback: persist to a JSON file so the frontend can demo profile updates even without DB
    const current = fs.existsSync(DEV_PROFILE_PATH) ? JSON.parse(fs.readFileSync(DEV_PROFILE_PATH, 'utf8')) : {}
    const updated = {
      name: resolvedName !== undefined ? resolvedName : current.name || current.fullName || 'Dev User',
      fullName: resolvedName !== undefined ? resolvedName : current.fullName || current.name || 'Dev User',
      email: email !== undefined ? email : current.email || '',
      school: resolvedSchool !== undefined ? resolvedSchool : current.school || current.schoolName || '' ,
      schoolName: resolvedSchool !== undefined ? resolvedSchool : current.schoolName || current.school || ''
    }
    fs.writeFileSync(DEV_PROFILE_PATH, JSON.stringify(updated, null, 2), 'utf8')
    return res.json({ message: 'Profile updated (dev fallback)', user: { id: 'dev-local', name: updated.name, email: updated.email, schoolName: updated.schoolName } })
  } catch (err) {
    console.error('PUT /api/users/me error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/users/change-password
router.post('/change-password', async (req, res) => {
  try {
    const { current, newPassword } = req.body || {}
    if (!current || !newPassword) return res.status(400).json({ message: 'Missing fields' })

    const mongooseConnected = mongoose.connection && mongoose.connection.readyState === 1

    if (mongooseConnected) {
      const user = await findCurrentUser()
      if (!user) return res.status(404).json({ message: 'No user found' })

      const match = await bcrypt.compare(current, user.password)
      if (!match) return res.status(400).json({ message: 'Current password incorrect' })

      const salt = await bcrypt.genSalt(10)
      user.password = await bcrypt.hash(newPassword, salt)
      await user.save()
      return res.json({ message: 'Password updated' })
    }

    // Dev fallback: persist password hash in DEV_PROFILE_PATH so change-password works when DB is down
    const existing = fs.existsSync(DEV_PROFILE_PATH) ? JSON.parse(fs.readFileSync(DEV_PROFILE_PATH, 'utf8')) : {}
    const storedHash = existing.passwordHash

    if (storedHash) {
      const match = await bcrypt.compare(current, storedHash)
      if (!match) return res.status(400).json({ message: 'Current password incorrect' })
    } else {
      // no stored password => accept any current (first set)
    }

    const salt = await bcrypt.genSalt(10)
    const newHash = await bcrypt.hash(newPassword, salt)
    const updated = { ...existing, passwordHash: newHash }
    fs.writeFileSync(DEV_PROFILE_PATH, JSON.stringify(updated, null, 2), 'utf8')
    return res.json({ message: 'Password updated (dev fallback)' })
  } catch (err) {
    console.error('POST /api/users/change-password error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

module.exports = router
