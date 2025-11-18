require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();

async function start() {
  // connect to DB in background so the server can start even if Mongo is temporarily unreachable.
  connectDB()
    .then(async () => {
      console.log('Background DB connection established')
      // seed admin if not exists (development convenience)
      if (process.env.NODE_ENV !== 'production') {
        try {
          const adminEmail = process.env.ADMIN_EMAIL || 'dlibrarymanagement@gmail.com';
          const adminPassword = process.env.ADMIN_PASSWORD || 'dlibrarym@#';
          const existing = await User.findOne({ email: adminEmail });
          if (!existing) {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(adminPassword, salt);
            const admin = new User({ name: 'Admin', email: adminEmail, password: hashed, isVerified: true, role: 'admin' });
            await admin.save();
            console.log('Seeded admin user:', adminEmail);
          } else {
            console.log('Admin user already exists:', adminEmail);
          }
        } catch (err) {
          console.error('Failed to seed admin user', err);
        }
      }
    })
    .catch(err => {
      console.warn('Background DB connection failed (will keep retrying):', err && err.message ? err.message : err)
    })

  // middleware
  const path = require('path')
  // Configure CORS so preflight and error responses include the CORS headers.
  // If FRONTEND_URL is set we only allow that origin (normalized). Otherwise allow any origin for convenience.
  const frontendUrlRaw = String(process.env.FRONTEND_URL || '').trim()
  const frontendUrl = frontendUrlRaw ? frontendUrlRaw.replace(/\/$/, '') : null

  app.use((req, res, next) => {
    // Allow the configured frontend origin or allow all when not set
    const origin = req.get('origin') || ''
    if (frontendUrl) {
      if (origin && origin.replace(/\/$/, '').startsWith(frontendUrl)) {
        res.setHeader('Access-Control-Allow-Origin', origin)
      }
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*')
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,Origin')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    // Let preflight requests short-circuit
    if (req.method === 'OPTIONS') return res.sendStatus(204)
    next()
  })

  app.use(express.json());

  // serve uploaded files when Cloudinary is not configured (dev fallback)
  const uploadsPath = path.join(__dirname, '..', 'uploads')
  app.use('/uploads', express.static(uploadsPath))

  // routes
  app.use('/api', require('./routes'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch(err => {
  console.error('Failed to start server', err);
});
