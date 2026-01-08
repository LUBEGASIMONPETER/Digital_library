const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { register, login, verify, verifyByCode, resendVerification } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify?token=...
router.get('/verify', verify);

// POST /api/auth/verify-code  { email, code }
router.post('/verify-code', verifyByCode);

// POST /api/auth/resend { email }
router.post('/resend', resendVerification);

// ============ GOOGLE OAUTH ============

// GET /api/auth/google - Initiate Google OAuth
router.get('/google', (req, res, next) => {
  // Check if Google OAuth is configured
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({ 
      message: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.' 
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// GET /api/auth/google/callback - Google OAuth callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/login?error=google_auth_failed`,
    session: false 
  }),
  (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign(
        { 
          id: req.user._id, 
          email: req.user.email, 
          role: req.user.role 
        },
        process.env.JWT_SECRET || 'fallback_jwt_secret',
        { expiresIn: '7d' }
      );

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const redirectUrl = req.user.role === 'admin' 
        ? `${frontendUrl}/admin?token=${token}`
        : `${frontendUrl}/dashboard?token=${token}`;
      
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('Google callback error:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/login?error=auth_failed`);
    }
  }
);

module.exports = router;
