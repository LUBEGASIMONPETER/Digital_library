const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'trophy'
  },
  category: {
    type: String,
    enum: ['milestone', 'reading', 'engagement', 'social', 'special'],
    default: 'milestone'
  },
  points: {
    type: Number,
    default: 10
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Achievement', achievementSchema);
