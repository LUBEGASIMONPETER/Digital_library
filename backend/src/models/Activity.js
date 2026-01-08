const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' },
  type: { type: String, enum: ['read', 'download', 'search'], default: 'read' },
  durationMinutes: { type: Number, default: 0 },
  pagesRead: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for quick aggregation of daily stats
ActivitySchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Activity', ActivitySchema);
