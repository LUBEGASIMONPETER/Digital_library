const express = require('express');
const router = express.Router();
const { sendVerificationEmail, sendAccountActionEmail } = require('../config/mailer');
const User = require('../models/User');
const Book = require('../models/Book')
const mongoose = require('mongoose')
const multer = require('multer')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')
const path = require('path')

// Helper to determine the public backend origin. Prefer explicit BACKEND_URL, then
// honor common proxy headers (x-forwarded-proto/host) so the generated URLs are
// correct when running behind a platform proxy (Render, Heroku, etc.).
function getBackendOrigin(req) {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL.replace(/\/$/, '')
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim()
  const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim()
  if (!host) return `${proto}://localhost:${process.env.PORT || 5000}`
  return `${proto}://${host}`
}

// helper to write buffer to local uploads folder when Cloudinary is not available
async function writeBufferToUploads(buffer, folder, filename) {
  const uploadsRoot = path.join(__dirname, '..', '..', 'uploads')
  const dir = path.join(uploadsRoot, folder)
  await fs.promises.mkdir(dir, { recursive: true })
  const filePath = path.join(dir, filename)
  await fs.promises.writeFile(filePath, buffer)
  // return a path served by express static: /uploads/<folder>/<filename>
  return `/uploads/${folder}/${filename}`
}

// multer memory storage for small files, we'll stream to Cloudinary
const storage = multer.memoryStorage()
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }) // 50MB limit

// helper to upload buffer to Cloudinary with timeout, returns upload result
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    // Set a 60 second timeout for the upload
    const timeout = setTimeout(() => {
      reject(new Error('Cloudinary upload timeout after 60 seconds'))
    }, 60000)

    try {
      const stream = cloudinary.uploader.upload_stream(
        { ...options, timeout: 60000 },
        (error, result) => {
          clearTimeout(timeout)
          if (error) return reject(error)
          resolve(result)
        }
      )
      stream.on('error', (err) => {
        clearTimeout(timeout)
        reject(err)
      })
      stream.end(buffer)
    } catch (err) {
      clearTimeout(timeout)
      reject(err)
    }
  })
}

// simple environment check to help debug missing Cloudinary config
// Prefer the runtime-detected flag exported from the cloudinary helper so we don't
// treat an incorrectly formatted CLOUDINARY_URL as "configured" and crash.
const CLOUDINARY_CONFIGURED = Boolean(cloudinary && cloudinary._configured)

// Helper: in production, only allow requests from the configured frontend origin
function allowedFromFrontend(req) {
  if (process.env.NODE_ENV !== 'production') return true
  const origin = String(req.get('origin') || req.get('referer') || '').replace(/\/$/, '')
  const raw = String(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '').trim()
  if (!raw) {
    console.warn('FRONTEND_URLS/FRONTEND_URL not set; allowing admin requests from any origin in production — consider setting FRONTEND_URLS for tighter security')
    return true
  }
  const allowed = raw.split(',').map(s => String(s).trim().replace(/\/$/, '')).filter(Boolean)
  return allowed.some(a => origin === a || origin.startsWith(a))
}

// POST /api/admin/test-email
// body: { to: string, link?: string }
router.post('/test-email', async (req, res) => {
  const { to, link } = req.body;
  if (!to) return res.status(400).json({ message: 'Missing `to` address' });
  try {
    const testLink = link || (process.env.FRONTEND_URL || 'http://localhost:5173') + '/auth/verify?token=test-token';
    await sendVerificationEmail(to, testLink);
    return res.json({ message: 'Test email sent (or logged) to ' + to });
  } catch (err) {
    console.error('Test email error', err);
    return res.status(500).json({ message: 'Failed to send test email', error: err.message });
  }
});

// GET /api/admin/diag
// Diagnostic: return config and request info to help debug production issues
router.get('/diag', async (req, res) => {
  try {
    const origin = String(req.get('origin') || req.get('referer') || '')
  const frontend = String(process.env.FRONTEND_URL || '')
    const mailerConfigured = Boolean((process.env.SMTP_HOST || process.env.MAILER_HOST) && (process.env.SMTP_USER || process.env.MAILER_USER) && (process.env.SMTP_PASS || process.env.MAILER_PASS))
    // Attempt to detect transporter readiness if mailer module exposes a checker
    let mailerReady = false
    try {
      const mailer = require('../config/mailer')
      if (mailer && typeof mailer.isMailerReady === 'function') {
        mailerReady = !!mailer.isMailerReady()
      }
    } catch (e) {
      mailerReady = false
    }
    const cloudinaryConfigured = Boolean(CLOUDINARY_CONFIGURED)
    // include last non-sensitive error (if any) to help debug production issues
    let lastError = null
    try {
      const debug = require('../config/debugStore')
      lastError = debug.getLastError()
    } catch (e) {
      lastError = null
    }
  // also show the platform-configured allowed origins (if any)
  const rawAllowed = String(process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  const allowedOrigins = rawAllowed ? rawAllowed.split(',').map(s => String(s).trim()) : []
    const allowed = (() => {
      try {
        // use allowedFromFrontend logic but don't enforce NODE_ENV here
        const normalizedOrigin = origin.replace(/\/$/, '')
        const normalizedAllowed = frontend.replace(/\/$/, '')
        if (!frontend) return 'FRONTEND_URL not set'
        return normalizedOrigin.startsWith(normalizedAllowed) ? 'allowed' : 'not-allowed'
      } catch (e) {
        return 'error'
      }
    })()
  
  // Cloudinary details
  const cloudinaryDetails = {
    configured: CLOUDINARY_CONFIGURED,
    configError: cloudinary._configError || null,
    cloudName: CLOUDINARY_CONFIGURED ? (cloudinary.config().cloud_name || 'unknown') : null,
    hasUrl: Boolean(process.env.CLOUDINARY_URL),
    hasKeys: Boolean(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET && process.env.CLOUDINARY_CLOUD_NAME)
  }
  
  return res.json({ 
    node_env: process.env.NODE_ENV || 'not-set', 
    frontend, 
    origin, 
    allowed, 
    mailerConfigured, 
    mailerReady, 
    cloudinaryConfigured: CLOUDINARY_CONFIGURED, 
    cloudinaryDetails,
    backendUrl: process.env.BACKEND_URL || 'not-set',
    allowedOrigins, 
    lastError 
  })
  } catch (err) {
    console.error('Diag error', err)
    return res.status(500).json({ message: 'Diag failed', error: err.message })
  }
})

// POST /api/admin/test-cloudinary
// Test Cloudinary upload with a tiny test image
router.post('/test-cloudinary', async (req, res) => {
  if (!CLOUDINARY_CONFIGURED) {
    return res.status(400).json({ 
      message: 'Cloudinary not configured',
      configError: cloudinary._configError || 'Missing CLOUDINARY_URL or individual keys',
      suggestion: 'Set CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME or set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
    })
  }
  
  try {
    // Create a tiny 1x1 pixel PNG for testing
    const testBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64')
    
    const result = await uploadBufferToCloudinary(testBuffer, { 
      resource_type: 'image', 
      folder: 'dlibrary/test',
      public_id: 'test-' + Date.now()
    })
    
    // Clean up test file
    if (result && result.public_id) {
      try {
        await cloudinary.uploader.destroy(result.public_id)
      } catch (e) {
        // ignore cleanup errors
      }
    }
    
    return res.json({ 
      message: 'Cloudinary test successful!',
      cloudName: cloudinary.config().cloud_name,
      testUrl: result && result.secure_url
    })
  } catch (err) {
    console.error('Cloudinary test failed', err)
    return res.status(500).json({ 
      message: 'Cloudinary test failed',
      error: err.message || String(err),
      suggestion: 'Check your Cloudinary credentials'
    })
  }
})

// GET /api/admin/unverified
// Development helper: list unverified users with their code and expiry
router.get('/unverified', async (req, res) => {
  try {
    const users = await User.find({ isVerified: false }).select('email verificationCode verificationCodeExpires verificationToken verificationTokenExpires').lean();
    return res.json({ count: users.length, users });
  } catch (err) {
    console.error('Failed to list unverified users', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/user?email=someone@example.com
// Development-only: return verification fields for a single user (no password)
router.get('/user', async (req, res) => {
  // Protect this endpoint in production unless request originates from FRONTEND_URL
  if (!allowedFromFrontend(req)) {
    return res.status(403).json({ message: 'Forbidden in production' });
  }

  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Missing `email` query parameter' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('email isVerified verificationCode verificationCodeExpires verificationToken verificationTokenExpires createdAt updatedAt')
      .lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('Failed to get user', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/dashboard-stats
// Return a summary of statistics for the admin dashboard
router.get('/dashboard-stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isDeleted: { $ne: true } });
    const verifiedUsers = await User.countDocuments({ isVerified: true, isDeleted: { $ne: true } });
    const totalBooks = await Book.countDocuments({});
    
    // Aggregating borrow stats
    const books = await Book.find({}).select('borrowCount availableCopies totalCopies');
    let totalBorrows = 0;
    let availableCopiesSum = 0;
    let totalCopiesSum = 0;
    books.forEach(b => {
      totalBorrows += (b.borrowCount || 0);
      availableCopiesSum += (b.availableCopies || 0);
      totalCopiesSum += (b.totalCopies || 0);
    });

    const recentUsers = await User.find({ isDeleted: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role status createdAt');

    const recentBooks = await Book.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author category createdAt');

    // System info
    const systemStatus = {
      api: 'operational',
      database: mongoose.connection.readyState === 1 ? 'healthy' : 'disconnected',
      storage: CLOUDINARY_CONFIGURED ? 'Cloudinary (Connected)' : 'Local FS',
      uploads: 'active'
    };

    return res.json({
      stats: {
        totalUsers,
        verifiedUsers,
        totalBooks,
        totalBorrows,
        availableCopiesSum,
        totalCopiesSum,
        userGrowth: 12, // Placeholder
        revenueGrowth: 8,
        todayVisits: Math.floor(Math.random() * 50) + 50 // placeholder until activity tracking is added
      },
      recentUsers,
      recentBooks,
      systemStatus
    });
  } catch (err) {
    console.error('Failed to get dashboard stats', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
// Return a list of users (development helper). Excludes password.
router.get('/users', async (req, res) => {
  // Protect this endpoint in production unless request originates from FRONTEND_URL
  if (!allowedFromFrontend(req)) {
    return res.status(403).json({ message: 'Forbidden in production' });
  }

  const includeDeleted = String(req.query.includeDeleted || '').toLowerCase() === 'true'

  try {
    // By default exclude soft-deleted users unless includeDeleted=true
    const query = includeDeleted ? {} : { isDeleted: { $ne: true } }
    const users = await User.find(query).select('name email role isVerified status suspendedUntil createdAt deletedAt deletedReason deletedBy isDeleted').lean();
    const mapped = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      // prefer explicit status field, fallback to isVerified
      status: (u.status) ? u.status : (u.isVerified ? 'active' : 'inactive'),
      suspendedUntil: u.suspendedUntil || null,
      joinDate: u.createdAt,
      lastLogin: null,
      booksBorrowed: 0,
      avatar: '',
      // deletion metadata
      isDeleted: !!u.isDeleted,
      deletedAt: u.deletedAt || null,
      deletedReason: u.deletedReason || '',
      deletedBy: u.deletedBy || ''
    }))
    return res.json({ count: mapped.length, users: mapped })
  } catch (err) {
    console.error('Failed to list users', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/admin/users/:id/ban
// Mark the user as banned (deactivated, not deleted)
router.put('/users/:id/ban', async (req, res) => {
  if (!allowedFromFrontend(req)) {
    return res.status(403).json({ message: 'Forbidden in production' });
  }
  const { id } = req.params
  const { reason, adminName } = req.body || {}
  try {
    const user = await User.findByIdAndUpdate(id, { status: 'banned' }, { new: true }).select('name email role status suspendedUntil createdAt').lean()
    if (!user) return res.status(404).json({ message: 'User not found' })
    // send notification email
    try {
      await sendAccountActionEmail(user.email, { action: 'banned', reason, adminName })
    } catch (mailErr) {
      console.error('Failed to send ban email', mailErr)
    }
    return res.json({ message: 'User banned', user })
  } catch (err) {
    console.error('Failed to ban user', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/admin/users/:id/suspend
// Body: { until: ISODateString }
router.put('/users/:id/suspend', async (req, res) => {
  if (!allowedFromFrontend(req)) {
    return res.status(403).json({ message: 'Forbidden in production' });
  }
  const { id } = req.params
  const { until, reason, adminName } = req.body || {}
  if (!until) return res.status(400).json({ message: 'Missing `until` field (ISO date string)' })
  const untilDate = new Date(until)
  if (isNaN(untilDate.getTime())) return res.status(400).json({ message: 'Invalid `until` date' })
  try {
    const update = { status: 'suspended', suspendedUntil: untilDate }
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('name email role status suspendedUntil createdAt').lean()
    if (!user) return res.status(404).json({ message: 'User not found' })
    // send notification email
    try {
      await sendAccountActionEmail(user.email, { action: 'suspended', reason, until: untilDate, adminName })
    } catch (mailErr) {
      console.error('Failed to send suspend email', mailErr)
    }
    return res.json({ message: 'User suspended', user })
  } catch (err) {
    console.error('Failed to suspend user', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/admin/users/:id/unsuspend
// Remove suspension and reactivate the user immediately
router.put('/users/:id/unsuspend', async (req, res) => {
  if (!allowedFromFrontend(req)) {
    return res.status(403).json({ message: 'Forbidden in production' });
  }
  const { id } = req.params
  const { reason, adminName } = req.body || {}
  try {
    const update = { status: 'active', suspendedUntil: null }
    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('name email role status suspendedUntil createdAt').lean()
    if (!user) return res.status(404).json({ message: 'User not found' })
    // send notification email about restoration
    try {
      await sendAccountActionEmail(user.email, { action: 'restored', reason, adminName, userName: user.name })
    } catch (mailErr) {
      console.error('Failed to send unsuspend email', mailErr)
    }
    return res.json({ message: 'User unsuspended', user })
  } catch (err) {
    console.error('Failed to unsuspend user', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/admin/users/:id/role
// Update a user's role (member, librarian, admin)
router.put('/users/:id/role', async (req, res) => {
  if (!allowedFromFrontend(req)) {
    return res.status(403).json({ message: 'Forbidden in production' });
  }
  const { id } = req.params
  const { role } = req.body || {}
  if (!role) return res.status(400).json({ message: 'Missing `role` in request body' })
  try {
    const allowed = ['member', 'librarian', 'admin']
    if (!allowed.includes(role)) return res.status(400).json({ message: 'Invalid role' })
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('name email role status createdAt').lean()
    if (!user) return res.status(404).json({ message: 'User not found' })
    // notify user about role change (best-effort)
    try {
      await sendAccountActionEmail(user.email, { action: 'role_changed', newRole: role, userName: user.name })
    } catch (mailErr) {
      console.error('Failed to send role change email', mailErr)
    }
    return res.json({ message: 'User role updated', user })
  } catch (err) {
    console.error('Failed to update user role', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/admin/users/:id
// Soft-delete a user (mark as deleted, recoverable)
router.delete('/users/:id', async (req, res) => {
  if (!allowedFromFrontend(req)) {
    return res.status(403).json({ message: 'Forbidden in production' });
  }
  const { id } = req.params
  const { reason, adminName } = req.body || {}
  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    // mark as deleted rather than removing
    user.isDeleted = true
    user.deletedAt = new Date()
    user.deletedReason = reason || ''
    user.deletedBy = adminName || ''
    await user.save()
    // send notification before marking deleted
    try {
      await sendAccountActionEmail(user.email, { action: 'deleted', reason, adminName, userName: user.name })
    } catch (mailErr) {
      console.error('Failed to send deletion email', mailErr)
    }
    return res.json({ message: 'User soft-deleted', id })
  } catch (err) {
    console.error('Failed to delete user', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// PUT /api/admin/users/:id/restore
// Restore a soft-deleted user
router.put('/users/:id/restore', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Forbidden in production' });
  }
  const { id } = req.params
  const { reason, adminName } = req.body || {}
  try {
    const user = await User.findById(id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.isDeleted = false
    user.deletedAt = null
    user.deletedReason = ''
    user.deletedBy = ''
    await user.save()
    // notify user of restoration
    try {
      await sendAccountActionEmail(user.email, { action: 'restored', reason, adminName, userName: user.name })
    } catch (mailErr) {
      console.error('Failed to send restore email', mailErr)
    }
    return res.json({ message: 'User restored', user })
  } catch (err) {
    console.error('Failed to restore user', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// POST /api/admin/books
// Accepts multipart/form-data: fields for title, author, isbn, category, description, totalCopies, availableCopies, publisher, publishedYear
// files: cover (image), file (pdf)
// DEBUG: POST /api/admin/books/debug
// Accepts multipart and returns diagnostic info about received files and fields without saving.
router.post('/books/debug', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
  try {
    const fields = req.body || {}
    const files = {}
    if (req.files) {
      Object.keys(req.files).forEach(k => {
        files[k] = req.files[k].map(f => ({ originalname: f.originalname, mimetype: f.mimetype, size: f.size }))
      })
    }
    return res.json({ message: 'Debug upload received', fields, files, cloudinaryConfigured: Boolean(cloudinary && cloudinary._configured) })
  } catch (err) {
    console.error('Upload debug failed', err)
    return res.status(500).json({ message: 'Upload debug failed', error: err.message })
  }
})

router.post('/books', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production you should protect this route with authentication/authorization
  }

  try {
    const {
      title, author, isbn, category, description, totalCopies = 1, availableCopies = 1, publisher, publishedYear,
      resourceType, examYear, examBoard
    } = req.body

    if (!title || !author || !category) return res.status(400).json({ message: 'Missing required fields: title, author, category' })

    // prefer provided URLs (when using remote urls instead of uploading files)
    let coverUrl = req.body.coverUrl || ''
    let fileUrl = req.body.fileUrl || ''

    // handle uploaded cover image (if provided)
    if (req.files && req.files.cover && req.files.cover[0]) {
      const coverFile = req.files.cover[0]
      // if Cloudinary is not configured, we cannot accept binary uploads
      if (!CLOUDINARY_CONFIGURED) {
        // fallback: write the file to local uploads folder and expose via /uploads
        try {
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${coverFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          const localPath = await writeBufferToUploads(coverFile.buffer, 'covers', filename)
          // prefer absolute backend origin when available; otherwise build from the incoming request host
          const backendOriginLocal = getBackendOrigin(req)
          coverUrl = backendOriginLocal + localPath
        } catch (fsErr) {
          console.error('Failed to write cover to local uploads', fsErr)
          return res.status(500).json({ message: 'Failed to save cover file on server', error: fsErr.message })
        }
      } else {
        // basic mimetype validation
        if (!coverFile.mimetype || !coverFile.mimetype.startsWith('image/')) {
          return res.status(400).json({ message: 'Cover must be an image file' })
        }
        try {
          const result = await uploadBufferToCloudinary(coverFile.buffer, { resource_type: 'image', folder: 'dlibrary/covers' })
          coverUrl = result && result.secure_url ? result.secure_url : coverUrl
        } catch (uplErr) {
          console.error('Cloudinary cover upload failed', uplErr)
          const resp = { message: 'Failed to upload cover image', error: uplErr.message || String(uplErr) }
          if (process.env.DEBUG_UPLOADS === 'true') resp.stack = uplErr.stack || String(uplErr)
          return res.status(502).json(resp)
        }
      }
      // coverUrl was set above (either from local fallback or from Cloudinary when configured)
      // No further upload attempt here — avoid duplicate uploads / errors when Cloudinary is not configured.
    }

    // handle uploaded book file (pdf) (if provided)
    if (req.files && req.files.file && req.files.file[0]) {
      const bookFile = req.files.file[0]
      if (!CLOUDINARY_CONFIGURED) {
        // fallback: save file locally
        try {
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${bookFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          const localPath = await writeBufferToUploads(bookFile.buffer, 'books', filename)
          const backendOriginLocal = getBackendOrigin(req)
          fileUrl = backendOriginLocal + localPath
        } catch (fsErr) {
          console.error('Failed to write book file to local uploads', fsErr)
          return res.status(500).json({ message: 'Failed to save book file on server', error: fsErr.message })
        }
      } else {
        // allow application/pdf or fallback to checking filename extension
        const isPdf = (bookFile.mimetype === 'application/pdf') || (bookFile.originalname && bookFile.originalname.toLowerCase().endsWith('.pdf'))
        if (!isPdf) {
          return res.status(400).json({ message: 'Book file must be a PDF' })
        }
        try {
          const result = await uploadBufferToCloudinary(bookFile.buffer, { resource_type: 'raw', folder: 'dlibrary/books' })
          fileUrl = result && result.secure_url ? result.secure_url : fileUrl
          } catch (uplErr) {
          console.error('Cloudinary book file upload failed', uplErr)
          // fallback to local storage if cloudinary fails
          // capture error info for debug responses when enabled
          const cloudErrInfo = { message: uplErr.message || String(uplErr) }
          if (process.env.DEBUG_UPLOADS === 'true') cloudErrInfo.stack = uplErr.stack || String(uplErr)
          try {
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${bookFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
            const localPath = await writeBufferToUploads(bookFile.buffer, 'books', filename)
            const backendOriginLocal = getBackendOrigin(req)
            fileUrl = backendOriginLocal + localPath
            console.warn('Fell back to local book file storage due to Cloudinary error')
          } catch (fsErr) {
            console.error('Fallback local write for book file also failed', fsErr)
            const resp = { message: 'Failed to upload book file', error: cloudErrInfo.message }
            if (process.env.DEBUG_UPLOADS === 'true') resp.cloudinary = cloudErrInfo, resp.stack = (fsErr && fsErr.stack) ? fsErr.stack : String(fsErr)
            return res.status(502).json(resp)
          }
        }
      }
    }

    const book = new Book({
      title, author, isbn, category, description,
      totalCopies: Number(totalCopies),
      availableCopies: Number(availableCopies),
      publisher, publishedYear: publishedYear ? Number(publishedYear) : undefined,
      coverUrl, fileUrl,
      resourceType: resourceType || 'textbook',
      examYear, examBoard: examBoard || 'UNEB'
    })

    await book.save()

    return res.status(201).json({ message: 'Book added', book })
  } catch (err) {
    console.error('Failed to add book', err)
    // provide a safe error message to client while logging full error server-side
    return res.status(500).json({ message: 'Server error while adding book', error: err.message })
  }
})

// Simple GET /api/admin/books to list saved books (development helper)
// GET /api/admin/books/:id - get a single book by id (development helper)
router.get('/books/:id', async (req, res) => {
  try {
    const { id } = req.params
    const book = await Book.findById(id).lean()
    if (!book) return res.status(404).json({ message: 'Book not found' })
    return res.json({ book })
  } catch (err) {
    console.error('Failed to get book', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.get('/books', async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 }).lean()
    return res.json({ count: books.length, books })
  } catch (err) {
    console.error('Failed to list books', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /api/admin/books/:id
// Remove a book from the database (development helper). In production protect this route.
router.delete('/books/:id', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production you should protect this route with authentication/authorization
  }

  const { id } = req.params
  try {
    // Use a direct delete operation to avoid depending on a document instance method
    const deleted = await Book.findByIdAndDelete(id)
    if (!deleted) return res.status(404).json({ message: 'Book not found' })

    // Note: we don't aggressively delete remote Cloudinary resources here. If files were saved locally
    // under /uploads we could attempt to remove them, but leaving files is acceptable for dev.
    return res.json({ message: 'Book deleted', id })
  } catch (err) {
    console.error('Failed to delete book', err)
    return res.status(500).json({ message: 'Server error while deleting book', error: err.message })
  }
})

// PUT /api/admin/books/:id
// Update an existing book. Accepts multipart/form-data similar to POST (cover, file)
router.put('/books/:id', upload.fields([{ name: 'cover', maxCount: 1 }, { name: 'file', maxCount: 1 }]), async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    // In production you should protect this route with authentication/authorization
  }

  const { id } = req.params

  try {
    const book = await Book.findById(id)
    if (!book) return res.status(404).json({ message: 'Book not found' })

    const {
      title, author, isbn, category, description, totalCopies, availableCopies, publisher, publishedYear,
      resourceType, examYear, examBoard
    } = req.body

    // Update scalar fields if provided
    if (title) book.title = title
    if (author) book.author = author
    if (isbn !== undefined) book.isbn = isbn
    if (category) book.category = category
    if (description !== undefined) book.description = description
    if (totalCopies !== undefined) book.totalCopies = Number(totalCopies)
    if (availableCopies !== undefined) book.availableCopies = Number(availableCopies)
    if (publisher !== undefined) book.publisher = publisher
    if (publishedYear !== undefined && publishedYear !== '') book.publishedYear = Number(publishedYear)
    if (resourceType) book.resourceType = resourceType
    if (examYear !== undefined) book.examYear = examYear
    if (examBoard !== undefined) book.examBoard = examBoard

    // prefer provided URLs (when using remote urls instead of uploading files)
    if (req.body.coverUrl) book.coverUrl = req.body.coverUrl
    if (req.body.fileUrl) book.fileUrl = req.body.fileUrl

    // handle uploaded cover image (if provided)
    if (req.files && req.files.cover && req.files.cover[0]) {
      const coverFile = req.files.cover[0]
      if (!CLOUDINARY_CONFIGURED) {
        try {
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${coverFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          const localPath = await writeBufferToUploads(coverFile.buffer, 'covers', filename)
          // Build a public absolute URL based on the incoming request/proxy headers
          const backendOriginLocal = getBackendOrigin(req)
          book.coverUrl = backendOriginLocal + localPath
        } catch (fsErr) {
          console.error('Failed to write cover to local uploads', fsErr)
          return res.status(500).json({ message: 'Failed to save cover file on server', error: fsErr.message })
        }
      } else {
        if (!coverFile.mimetype || !coverFile.mimetype.startsWith('image/')) {
          return res.status(400).json({ message: 'Cover must be an image file' })
        }
        try {
          const result = await uploadBufferToCloudinary(coverFile.buffer, { resource_type: 'image', folder: 'dlibrary/covers' })
          book.coverUrl = result && result.secure_url ? result.secure_url : book.coverUrl
        } catch (uplErr) {
          console.error('Cloudinary cover upload failed', uplErr)
          // fallback: write locally
          try {
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${coverFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
            const localPath = await writeBufferToUploads(coverFile.buffer, 'covers', filename)
            const backendOriginLocal = getBackendOrigin(req)
            book.coverUrl = backendOriginLocal + localPath
            console.warn('Fell back to local cover storage due to Cloudinary error')
          } catch (fsErr) {
            console.error('Fallback local write for cover also failed', fsErr)
            const resp = { message: 'Failed to upload cover image', error: String(uplErr) }
            if (process.env.DEBUG_UPLOADS === 'true') resp.stack = uplErr && uplErr.stack ? uplErr.stack : String(uplErr)
            return res.status(502).json(resp)
          }
        }
      }
    }

    // handle uploaded book file (pdf) (if provided)
    if (req.files && req.files.file && req.files.file[0]) {
      const bookFile = req.files.file[0]
      if (!CLOUDINARY_CONFIGURED) {
        try {
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${bookFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
          const localPath = await writeBufferToUploads(bookFile.buffer, 'books', filename)
          const backendOriginLocal = getBackendOrigin(req)
          book.fileUrl = backendOriginLocal + localPath
        } catch (fsErr) {
          console.error('Failed to write book file to local uploads', fsErr)
          return res.status(500).json({ message: 'Failed to save book file on server', error: fsErr.message })
        }
      } else {
        const isPdf = (bookFile.mimetype === 'application/pdf') || (bookFile.originalname && bookFile.originalname.toLowerCase().endsWith('.pdf'))
        if (!isPdf) return res.status(400).json({ message: 'Book file must be a PDF' })
        try {
          const result = await uploadBufferToCloudinary(bookFile.buffer, { resource_type: 'raw', folder: 'dlibrary/books' })
          book.fileUrl = result && result.secure_url ? result.secure_url : book.fileUrl
        } catch (uplErr) {
          console.error('Cloudinary book file upload failed', uplErr)
          try {
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${bookFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
            const localPath = await writeBufferToUploads(bookFile.buffer, 'books', filename)
            const backendOriginLocal = getBackendOrigin(req)
            book.fileUrl = backendOriginLocal + localPath
            console.warn('Fell back to local book file storage due to Cloudinary error')
          } catch (fsErr) {
            console.error('Fallback local write for book file also failed', fsErr)
            return res.status(502).json({ message: 'Failed to upload book file', error: String(uplErr) })
          }
        }
      }
    }

    await book.save()
    return res.json({ message: 'Book updated', book })
  } catch (err) {
    console.error('Failed to update book', err)
    return res.status(500).json({ message: 'Server error while updating book', error: err.message })
  }
})

// POST /api/admin/books/fix-urls
// Utility endpoint to fix books with localhost or incorrect URLs.
// Will replace any localhost:XXXX in coverUrl/fileUrl with the correct BACKEND_URL.
router.post('/books/fix-urls', async (req, res) => {
  if (!allowedFromFrontend(req)) {
    return res.status(403).json({ message: 'Forbidden in production' })
  }

  const backendOrigin = getBackendOrigin(req)
  if (!backendOrigin || backendOrigin.includes('localhost')) {
    return res.status(400).json({
      message: 'Cannot fix URLs: BACKEND_URL is not set or still points to localhost. Set BACKEND_URL env var to your production backend URL.'
    })
  }

  try {
    // Find all books with localhost in their URLs
    const books = await Book.find({
      $or: [
        { coverUrl: { $regex: /localhost/i } },
        { fileUrl: { $regex: /localhost/i } }
      ]
    })

    if (books.length === 0) {
      return res.json({ message: 'No books with localhost URLs found', fixed: 0 })
    }

    let fixed = 0
    for (const book of books) {
      let changed = false
      
      // Fix coverUrl
      if (book.coverUrl && /localhost/i.test(book.coverUrl)) {
        // Extract the path portion after localhost:port
        const match = book.coverUrl.match(/localhost:\d+(\/uploads\/.+)$/i)
        if (match && match[1]) {
          book.coverUrl = backendOrigin + match[1]
          changed = true
        }
      }
      
      // Fix fileUrl
      if (book.fileUrl && /localhost/i.test(book.fileUrl)) {
        const match = book.fileUrl.match(/localhost:\d+(\/uploads\/.+)$/i)
        if (match && match[1]) {
          book.fileUrl = backendOrigin + match[1]
          changed = true
        }
      }
      
      if (changed) {
        await book.save()
        fixed++
      }
    }

    return res.json({
      message: `Fixed ${fixed} book(s) with localhost URLs`,
      fixed,
      backendOrigin
    })
  } catch (err) {
    console.error('Failed to fix book URLs', err)
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET /api/admin/books/check-urls
// Diagnostic endpoint to list books with potentially broken URLs
router.get('/books/check-urls', async (req, res) => {
  try {
    const books = await Book.find({}).select('title coverUrl fileUrl').lean()
    const issues = books.filter(b => {
      const hasBadCover = b.coverUrl && (/localhost/i.test(b.coverUrl) || !b.coverUrl.startsWith('http'))
      const hasBadFile = b.fileUrl && (/localhost/i.test(b.fileUrl) || !b.fileUrl.startsWith('http'))
      return hasBadCover || hasBadFile
    })
    return res.json({
      total: books.length,
      issueCount: issues.length,
      issues: issues.map(b => ({ id: b._id, title: b.title, coverUrl: b.coverUrl, fileUrl: b.fileUrl })),
      backendOrigin: getBackendOrigin(req)
    })
  } catch (err) {
    console.error('Failed to check book URLs', err)
    return res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET /api/admin/analytics
// Returns collection analytics including category distribution and borrowing stats
router.get('/analytics', async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments()
    const availableBooks = await Book.countDocuments({ status: 'available' })
    const maintenanceBooks = await Book.countDocuments({ status: 'maintenance' })
    const unavailableBooks = await Book.countDocuments({ status: 'unavailable' })
    
    // User metrics
    const totalUsers = await User.countDocuments()
    const activeUsers = await User.countDocuments({ isBanned: { $ne: true } })
    const bannedUsers = await User.countDocuments({ isBanned: true })
    const instructors = await User.countDocuments({ role: 'instructor' })
    const students = await User.countDocuments({ role: { $in: ['student', 'member'] } })

    // Category distribution
    const categoryStats = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ])

    // Resource type distribution
    const typeStats = await Book.aggregate([
      { $group: { _id: '$resourceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])

    // Recent activity (Last 10 books added)
    const recentActivity = await Book.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title author createdAt resourceType')

    // Monthly growth (books added per month for last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const growthStats = await Book.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ])

    return res.json({
      metrics: {
        totalBooks,
        availableBooks,
        maintenanceBooks,
        unavailableBooks,
        totalUsers,
        activeUsers,
        bannedUsers,
        instructors,
        students,
        borrowCount: await Book.aggregate([{ $group: { _id: null, total: { $sum: '$borrowCount' } } }]).then(res => res[0]?.total || 0)
      },
      categories: categoryStats.map(c => ({ name: c._id || 'Unknown', count: c.count })),
      types: typeStats.map(t => ({ name: t._id || 'other', count: t.count })),
      growth: growthStats.map(g => ({ month: g._id, count: g.count })),
      recentActivity: recentActivity.map(b => ({
        id: b._id,
        action: 'Added to Library',
        resource: b.title,
        type: b.resourceType,
        time: b.createdAt
      }))
    })
  } catch (err) {
    console.error('Analytics error', err)
    return res.status(500).json({ message: 'Failed to fetch analytics' })
  }
})

module.exports = router;


