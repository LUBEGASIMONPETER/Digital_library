const express = require('express');
const router = express.Router();
const { createTicket, getTickets } = require('../controllers/supportController');

// POST /api/support/tickets
router.post('/tickets', createTicket);

// GET /api/support/tickets?userId=...
router.get('/tickets', getTickets);

module.exports = router;
