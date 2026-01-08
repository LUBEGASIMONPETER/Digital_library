const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Activity = require('../models/Activity')
const Achievement = require('../models/Achievement')
const { checkAndUnlockAchievements, getUserAchievements, seedAchievements } = require('../services/achievementService')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const cloudinary = require('../config/cloudinary')
const { requireAuth } = require('../middleware/auth')

// Seed achievements on startup
seedAchievements();

// Protected all user routes
router.use(requireAuth);

// multer memory storage for small files, we'll stream to Cloudinary
const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }) // 10MB limit for avatars

// helper to upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { ...options, timeout: 60000 },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      }
    )
    stream.end(buffer)
  })
}

// dev fallback file (used when MongoDB is not connected)
const DEV_PROFILE_PATH = path.join(__dirname, '..', 'dev_profile.json')

// NOTE: These are development-friendly user endpoints. In production you MUST
// protect these routes with authentication & proper authorization.

// Helper to verify JWT token
function verifyJwtToken(req) {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret')
      return decoded
    } catch (err) {
      return null
    }
  }
  return null
}

// Helper to find the authenticated user based on request context.
async function findCurrentUser(req) {
  // 1. Try to extract user from JWT token (for OAuth)
  const decoded = verifyJwtToken(req)
  if (decoded && decoded.id && mongoose.Types.ObjectId.isValid(decoded.id)) {
    try {
      const u = await User.findById(decoded.id)
      if (u) return u
    } catch (err) {}
  }

  // 2. Try to find user by ID provided in headers or query (set by frontend apiFetch)
  const userId = req.headers['x-user-id'] || req.query.userId || (req.body && req.body.userId)
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    try {
      const u = await User.findById(userId)
      if (u) return u
    } catch (err) {}
  }

  // 3. Fallback: prefer explicit admin/email from env for convenience
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const u = await User.findOne({ email: adminEmail })
    if (u) return u
  }
  // 4. Last fallback: first user in DB
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

// GET /api/users/profile - alias for /me with JWT support
router.get('/profile', async (req, res) => {
  try {
    const user = await findCurrentUser(req)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      schoolName: user.schoolName,
      location: user.location,
      gender: user.gender,
      contact: user.contact,
      role: user.role || 'student',
      avatar: user.avatar,
      authProvider: user.authProvider || 'local',
      createdAt: user.createdAt,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/users/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user
    const out = {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      level: user.level || 'Student',
      schoolName: user.schoolName || '',
      location: user.location || '',
      contact: user.contact || '',
      role: user.role || 'user',
      avatarUrl: user.avatarUrl || '',
      notificationPreferences: user.notificationPreferences || { email: true, sms: false, reminders: true, marketing: false }
    }
    return res.json({ user: out })
  } catch (err) {
    console.error('GET /api/users/me error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/users/me
router.put('/me', requireAuth, async (req, res) => {
  try {
    const user = req.user
    const { 
      fullName, name, email, school, schoolName, bio, level, 
      contact, location, gender, notificationPreferences 
    } = req.body || {}
    const resolvedName = fullName !== undefined ? fullName : name
    const resolvedSchool = school !== undefined ? school : schoolName

    if (resolvedName !== undefined) user.name = resolvedName
    if (resolvedSchool !== undefined) user.schoolName = resolvedSchool
    if (bio !== undefined) user.bio = bio
    if (level !== undefined) user.level = level
    if (contact !== undefined) user.contact = contact
    if (location !== undefined) user.location = location
    if (gender !== undefined) user.gender = gender
    if (notificationPreferences !== undefined) {
      user.notificationPreferences = { ...user.notificationPreferences, ...notificationPreferences }
    }

    if (email !== undefined && email !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: user._id } })
      if (exists) return res.status(400).json({ message: 'Email already in use' })
      user.email = email.toLowerCase().trim()
    }

    await user.save()
    return res.json({ 
      message: 'Profile updated', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        schoolName: user.schoolName,
        bio: user.bio,
        level: user.level,
        avatarUrl: user.avatarUrl,
        notificationPreferences: user.notificationPreferences
      } 
    })
  } catch (err) {
    console.error('PUT /api/users/me error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/users/avatar
router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' })
    
    const user = req.user

    let avatarUrl = ''
    let avatarPublicId = ''

    if (cloudinary && cloudinary._configured) {
      const result = await uploadBufferToCloudinary(req.file.buffer, {
        folder: 'avatars',
        transformation: [{ width: 400, height: 400, crop: 'fill' }]
      })
      avatarUrl = result.secure_url
      avatarPublicId = result.public_id
    } else {
      // local fallback
      const filename = `avatar-${user._id}-${Date.now()}${path.extname(req.file.originalname)}`
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'avatars')
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
      fs.writeFileSync(path.join(uploadsDir, filename), req.file.buffer)
      avatarUrl = `/uploads/avatars/${filename}`
    }

    user.avatarUrl = avatarUrl
    user.avatarPublicId = avatarPublicId
    await user.save()

    return res.json({ message: 'Avatar updated', avatarUrl })
  } catch (err) {
    console.error('Avatar upload error', err)
    return res.status(500).json({ message: 'Server error during upload' })
  }
})

// POST /api/users/change-password
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { current, newPassword } = req.body || {}
    if (!current || !newPassword) return res.status(400).json({ message: 'Missing fields' })

    const user = req.user

    // Google OAuth users might not have a password
    if (user.authProvider === 'google' && !user.password) {
      return res.status(400).json({ message: 'Google accounts cannot change password here. Use Google account settings.' })
    }

    const match = await bcrypt.compare(current, user.password)
    if (!match) return res.status(400).json({ message: 'Current password incorrect' })

    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)
    await user.save()
    return res.json({ message: 'Password updated' })
  } catch (err) {
    console.error('POST /api/users/change-password error', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// GET /api/users/dashboard-stats
router.get('/dashboard-stats', requireAuth, async (req, res) => {
  try {
    const user = req.user

    const recentActivities = await Activity.find({ user: user._id })
      .sort({ date: -1 })
      .limit(5)
      .populate('book', 'title author');

    const formattedRecent = recentActivities.map(a => ({
      title: a.book?.title || 'Unknown Resource',
      action: a.type === 'read' ? 'Read' : 'Activity',
      time: new Date(a.date).toLocaleDateString()
    }));

    const stats = {
      readingStreak: user.readingStreak || 0,
      totalBooksRead: user.totalBooksRead || 0,
      studyHours: Math.round((user.studyHours || 0) * 10) / 10,
      downloadedResources: user.downloads?.length || 0,
      favoritesCount: user.favorites?.length || 0,
      subjectProgress: [
        { name: "General Knowledge", progress: user.totalBooksRead > 0 ? 50 : 0 }
      ],
      recentActivity: formattedRecent
    }

    return res.json({
      success: true,
      user: {
        name: user.name,
        school: user.schoolName || 'Not Set',
        level: user.level || 'Student',
        joinDate: user.createdAt
      },
      stats
    })
  } catch (err) {
    console.error('Fetch dashboard stats error:', err);
    res.status(500).json({ message: 'Error fetching dashboard stats' });
  }
});

// GET /api/users/favorites
router.get('/favorites', requireAuth, async (req, res) => {
  const user = req.user;
  await user.populate('favorites');
  return res.json({ favorites: user.favorites });
});

router.get('/downloads', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    await user.populate('downloads');
    return res.json({ downloads: user.downloads || [] });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching downloads' });
  }
});

router.post('/download/:bookId', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { bookId } = req.params;
    let newAchievements = [];
    
    if (!user.downloads.includes(bookId)) {
      user.downloads.push(bookId);
      user.downloadedResources = (user.downloadedResources || 0) + 1;
      await user.save();
      
      // Check for download achievements
      newAchievements = await checkAndUnlockAchievements(user._id, 'download');
    }
    res.json({ success: true, downloads: user.downloads.length, newAchievements });
  } catch (err) {
    res.status(500).json({ message: 'Error recording download' });
  }
});

router.post('/favorite/:bookId', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { bookId } = req.params;
    let newAchievements = [];
    
    const index = user.favorites.indexOf(bookId);
    if (index === -1) {
      user.favorites.push(bookId);
      await user.save();
      
      // Check for favorite achievements
      newAchievements = await checkAndUnlockAchievements(user._id, 'favorite');
    } else {
      user.favorites.splice(index, 1);
      await user.save();
    }
    
    res.json({ success: true, isFavorite: index === -1, newAchievements });
  } catch (err) {
    res.status(500).json({ message: 'Error updating favorites' });
  }
});

router.post('/log-activity', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { type, durationMinutes, pagesRead, bookId } = req.body;
    
    const activity = new Activity({
      user: user._id,
      book: bookId,
      type: type || 'read',
      durationMinutes: durationMinutes || 0,
      pagesRead: pagesRead || 0
    });
    
    await activity.save();

    // Also update user's lifetime stats
    let newAchievements = [];
    if (pagesRead && pagesRead > 0) {
      user.totalBooksRead = (user.totalBooksRead || 0) + 1;
      // Check for reading achievements
      const readAchievements = await checkAndUnlockAchievements(user._id, 'read');
      newAchievements = [...newAchievements, ...readAchievements];
    }
    if (durationMinutes) {
      user.studyHours = (user.studyHours || 0) + (durationMinutes / 60);
      // Check for study time achievements
      const timeAchievements = await checkAndUnlockAchievements(user._id, 'study_time');
      newAchievements = [...newAchievements, ...timeAchievements];
    }
    await user.save();

    res.json({ success: true, newAchievements });
  } catch (err) {
    res.status(500).json({ message: 'Error logging activity' });
  }
});

router.get('/today-activity', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const activities = await Activity.find({
      user: user._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    const totalMinutes = activities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0);
    const totalPages = activities.reduce((sum, a) => sum + (a.pagesRead || 0), 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const readingTime = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    res.json({
      readingTime: totalMinutes > 0 ? readingTime : '0m',
      pagesRead: totalPages
    });
  } catch (err) {
    console.error('Fetch today activity error:', err);
    res.status(500).json({ message: 'Error fetching today activity' });
  }
});

// ============ ACHIEVEMENTS ============

// GET /api/users/achievements - Get all achievements with user's unlock status
router.get('/achievements', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const achievements = await getUserAchievements(user._id);
    const totalPoints = user.totalPoints || 0;
    const unlockedCount = achievements.filter(a => a.unlocked).length;

    res.json({
      success: true,
      achievements,
      stats: {
        totalPoints,
        unlockedCount,
        totalCount: achievements.length
      }
    });
  } catch (err) {
    console.error('Get achievements error:', err);
    res.status(500).json({ message: 'Error fetching achievements' });
  }
});

// POST /api/users/check-achievements - Manually trigger achievement check
router.post('/check-achievements', requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const { triggerType, extraData } = req.body;

    const newAchievements = await checkAndUnlockAchievements(user._id, triggerType, extraData || {});

    res.json({
      success: true,
      newAchievements
    });
  } catch (err) {
    console.error('Check achievements error:', err);
    res.status(500).json({ message: 'Error checking achievements' });
  }
});

module.exports = router
