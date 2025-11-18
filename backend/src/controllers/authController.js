const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail } = require('../config/mailer');

exports.register = async (req, res) => {
  const { fullName, schoolName, location, gender, contact, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({
      name: fullName,
      schoolName,
      location,
      gender,
      contact,
      email,
      password: hashed,
      isVerified: false,
    });

  // create verification token and numeric code
  const token = crypto.randomBytes(24).toString('hex');
  user.verificationToken = token;
  user.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24; // 24h
  const code = (Math.floor(100000 + Math.random() * 900000)).toString(); // 6-digit
  user.verificationCode = code;
  user.verificationCodeExpires = Date.now() + 1000 * 60 * 60 * 24; // 24h

    await user.save();

  console.log('Registered user:', email, 'verificationCode:', user.verificationCode, 'expires:', new Date(user.verificationCodeExpires).toISOString())

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${frontend}/auth/verify?token=${token}`;

  // send verification email (if SMTP configured, will send; otherwise logged to console)
  await sendVerificationEmail(email, { link: verifyLink, code });

    return res.status(201).json({ message: 'Account created. Verification email sent.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.verify = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: 'Token is required' });
  try {
    console.log('Attempting email verification for token:', token)
    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } });
    if (!user) {
      console.log('No matching user found for verification token')
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    console.log('Verified user id:', user._id.toString())

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyByCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: 'Email and code are required' });
  try {
    const user = await User.findOne({ email, verificationCode: code, verificationCodeExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired code' });

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.resendVerification = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    // create new code and expiry
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 1000 * 60 * 60 * 24; // 24h

    // also refresh token
    const token = crypto.randomBytes(24).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 1000 * 60 * 60 * 24;

    await user.save();

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyLink = `${frontend}/auth/verify?token=${token}`;
    await sendVerificationEmail(email, { link: verifyLink, code });

    return res.json({ message: 'Verification resent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.isVerified) return res.status(401).json({ message: 'Please verify your email before logging in' });

    // Prevent login if account was soft-deleted
    if (user.isDeleted) {
      return res.status(403).json({ message: 'This account has been removed. Contact support for assistance.' });
    }

    // Enforce account status checks
    if (user.status === 'banned') {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact support for more information.' });
    }
    if (user.status === 'suspended') {
      const until = user.suspendedUntil
      if (until && new Date(until).getTime() > Date.now()) {
        return res.status(403).json({ message: `Your account is suspended until ${new Date(until).toLocaleString()}.` });
      }
      // suspension expiry passed — fall through (optionally clear status)
    }

    // TODO: issue JWT here. For now return basic success and minimal user info
    return res.json({
      message: 'Login successful',
      userId: user._id,
      user: {
        id: user._id,
        name: user.name,
        schoolName: user.schoolName || '' ,
        email: user.email,
        role: user.role || 'user'
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
