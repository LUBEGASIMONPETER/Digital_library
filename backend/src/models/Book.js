const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  category: { type: String, required: true },
  description: { type: String },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  publisher: { type: String },
  publishedYear: { type: Number },
  coverUrl: { type: String },
  fileUrl: { type: String },
  addedDate: { type: Date, default: Date.now },
  borrowCount: { type: Number, default: 0 },
  status: { type: String, default: 'available' },
  resourceType: { type: String, enum: ['textbook', 'past_paper', 'reference', 'handbook', 'study_guide'], default: 'textbook' },
  examYear: { type: String },
  examBoard: { type: String, default: 'UNEB' }
}, { timestamps: true })

module.exports = mongoose.model('Book', BookSchema)
