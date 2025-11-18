const express = require('express');
const router = express.Router();
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

module.exports = router;
