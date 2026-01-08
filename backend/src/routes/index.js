const express = require('express');
const router = express.Router();

// health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// auth routes (public - for login/signup)
router.use('/auth', require('./auth'));
// books routes (public list, protected for reading)
router.use('/books', require('./books'));
// admin utilities (protected - admin only)
router.use('/admin', require('./admin'));
// user profile (protected)
router.use('/users', require('./users'));
// support routes (protected)
router.use('/support', require('./support'));

module.exports = router;
