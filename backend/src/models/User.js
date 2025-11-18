const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  schoolName: { type: String },
  location: { type: String },
  gender: { type: String },
  contact: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
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
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
