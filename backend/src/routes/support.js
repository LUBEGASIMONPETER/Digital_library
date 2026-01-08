const express = require('express');
const router = express.Router();
const { createTicket, getTickets } = require('../controllers/supportController');
const { requireAuth } = require('../middleware/auth');

// POST /api/support/tickets
router.post('/tickets', requireAuth, createTicket);

// GET /api/support/tickets?userId=...
router.get('/tickets', requireAuth, getTickets);

module.exports = router;
