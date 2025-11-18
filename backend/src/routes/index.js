const express = require('express');
const router = express.Router();

// health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// auth routes
router.use('/auth', require('./auth'));
// admin utilities (test email)
router.use('/admin', require('./admin'));
// user profile (development helpers)
router.use('/users', require('./users'));

module.exports = router;
