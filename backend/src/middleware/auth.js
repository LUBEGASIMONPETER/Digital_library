const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Authentication middleware that verifies the user is logged in.
 * Checks for JWT token in Authorization header or X-User-ID header.
 */
const requireAuth = async (req, res, next) => {
  try {
    let userId = null;

    // 1. Check for JWT token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        // Token invalid or expired
      }
    }

    // 2. Fall back to X-User-ID header (existing auth mechanism)
    if (!userId) {
      userId = req.headers['x-user-id'] || req.query.userId;
    }

    // 3. Validate the user ID
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ 
        message: 'Authentication required. Please log in to continue.',
        code: 'AUTH_REQUIRED'
      });
    }

    // 4. Check if user exists in database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ 
        message: 'User not found. Please log in again.',
        code: 'USER_NOT_FOUND'
      });
    }

    // 5. Attach user to request object for use in route handlers
    req.user = user;
    req.userId = user._id;

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Middleware that requires the user to be an admin.
 * Must be used after requireAuth middleware.
 */
const requireAdmin = async (req, res, next) => {
  // First ensure user is authenticated
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Authentication required',
      code: 'AUTH_REQUIRED'
    });
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required',
      code: 'ADMIN_REQUIRED'
    });
  }

  next();
};

/**
 * Optional authentication - doesn't block request but attaches user if available.
 * Useful for routes that work for both authenticated and unauthenticated users.
 */
const optionalAuth = async (req, res, next) => {
  try {
    let userId = null;

    // Check for JWT token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (err) {
        // Token invalid - continue without auth
      }
    }

    // Fall back to X-User-ID
    if (!userId) {
      userId = req.headers['x-user-id'] || req.query.userId;
    }

    // Try to get user if we have an ID
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }

    next();
  } catch (err) {
    // Continue without auth on error
    next();
  }
};

module.exports = { requireAuth, requireAdmin, optionalAuth };
