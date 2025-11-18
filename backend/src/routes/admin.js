const express = require('express');
const router = express.Router();
const { sendVerificationEmail, sendAccountActionEmail } = require('../config/mailer');
const User = require('../models/User');
const Book = require('../models/Book')
const multer = require('multer')
const cloudinary = require('../config/cloudinary')
const fs = require('fs')
const path = require('path')

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

// helper to upload buffer to Cloudinary, returns upload result
function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error)
        resolve(result)
      })
      stream.end(buffer)
    } catch (err) {
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
    const cloudinaryConfigured = Boolean(CLOUDINARY_CONFIGURED)
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
    return res.json({ node_env: process.env.NODE_ENV || 'not-set', frontend, origin, allowed, mailerConfigured, cloudinaryConfigured, allowedOrigins })
  } catch (err) {
    console.error('Diag error', err)
    return res.status(500).json({ message: 'Diag failed', error: err.message })
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
      title, author, isbn, category, description, totalCopies = 1, availableCopies = 1, publisher, publishedYear
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
          const backendOrigin = process.env.BACKEND_URL || (req.protocol + '://' + req.get('host'))
          coverUrl = backendOrigin + localPath
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
          return res.status(502).json({ message: 'Failed to upload cover image', error: uplErr.message || String(uplErr) })
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
          const backendOrigin = process.env.BACKEND_URL || (req.protocol + '://' + req.get('host'))
          fileUrl = backendOrigin + localPath
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
          try {
            const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}-${bookFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`
            const localPath = await writeBufferToUploads(bookFile.buffer, 'books', filename)
            const backendOrigin = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`
            fileUrl = backendOrigin + localPath
            console.warn('Fell back to local book file storage due to Cloudinary error')
          } catch (fsErr) {
            console.error('Fallback local write for book file also failed', fsErr)
            return res.status(502).json({ message: 'Failed to upload book file', error: uplErr.message || String(uplErr) })
          }
        }
      }
    }

    const book = new Book({
      title, author, isbn, category, description,
      totalCopies: Number(totalCopies),
      availableCopies: Number(availableCopies),
      publisher, publishedYear: publishedYear ? Number(publishedYear) : undefined,
      coverUrl, fileUrl
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
    const books = await Book.find({}).select('title author category coverUrl fileUrl addedDate').sort({ createdAt: -1 }).lean()
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
      title, author, isbn, category, description, totalCopies, availableCopies, publisher, publishedYear
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
          const backendOrigin = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`
          book.coverUrl = backendOrigin + localPath
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
            const backendOrigin = process.env.BACKEND_URL || (req.protocol + '://' + req.get('host'))
            book.coverUrl = backendOrigin + localPath
            console.warn('Fell back to local cover storage due to Cloudinary error')
          } catch (fsErr) {
            console.error('Fallback local write for cover also failed', fsErr)
            return res.status(502).json({ message: 'Failed to upload cover image', error: String(uplErr) })
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
          const backendOrigin = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5001}`
          book.fileUrl = backendOrigin + localPath
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
            const backendOrigin = process.env.BACKEND_URL || (req.protocol + '://' + req.get('host'))
            book.fileUrl = backendOrigin + localPath
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

module.exports = router;


