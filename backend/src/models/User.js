const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  googleId: { type: String, sparse: true, index: true },
  schoolName: { type: String },
  location: { type: String },
  gender: { type: String },
  contact: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  level: { type: String, default: 'Student' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  downloads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  verificationCode: { type: String },
  verificationCodeExpires: { type: Date },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // account status: active, inactive, suspended, banned
  status: { type: String, enum: ['active', 'inactive', 'suspended', 'banned'], default: 'inactive' },
  // if suspended, until what date
  suspendedUntil: { type: Date, default: null },
  // soft-delete fields
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedReason: { type: String, default: '' },
  deletedBy: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  avatarPublicId: { type: String, default: '' },
  notificationPreferences: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    reminders: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false }
  },
  readingStreak: { type: Number, default: 0 },
  totalBooksRead: { type: Number, default: 0 },
  studyHours: { type: Number, default: 0 },
  downloadedResources: { type: Number, default: 0 },
  achievements: [{
    achievementKey: { type: String, required: true },
    unlockedAt: { type: Date, default: Date.now }
  }],
  totalPoints: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
