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
  app.use(cors());
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
