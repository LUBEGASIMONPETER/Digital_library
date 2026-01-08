const Ticket = require('../models/Ticket');

exports.createTicket = async (req, res) => {
  const { userId, name, email, subject, message, priority } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const ticket = new Ticket({
      user: userId, // Assuming frontend sends userId
      name,
      email,
      subject,
      message,
      priority: priority || 'Medium'
    });

    await ticket.save();
    res.status(201).json({ message: 'Ticket created successfully', ticket });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTickets = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const tickets = await Ticket.find({ user: userId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
