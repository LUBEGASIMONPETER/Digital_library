const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { checkAndUnlockAchievements } = require('../services/achievementService');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Only configure Google strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-domain.com/api/auth/google/callback'
      : 'http://localhost:5000/api/auth/google/callback');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        return done(null, user);
      }

      // Check if user exists with same email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          if (!user.avatarUrl && profile.photos && profile.photos[0]) {
            user.avatarUrl = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }
      }

      // Create new user
      const newUser = new User({
        googleId: profile.id,
        name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim() || 'Google User',
        email: email ? email.toLowerCase() : `google_${profile.id}@placeholder.com`,
        password: `google_oauth_${Date.now()}_${Math.random().toString(36)}`, // Random password for OAuth users
        avatarUrl: profile.photos && profile.photos[0] ? profile.photos[0].value : '',
        isVerified: true, // Google accounts are pre-verified
        status: 'active'
      });

      await newUser.save();

      // Unlock "The Initiate" achievement for creating an account
      try {
        await checkAndUnlockAchievements(newUser._id, 'signup');
      } catch (achErr) {
        console.error('Achievement check failed:', achErr);
      }

      done(null, newUser);
    } catch (err) {
      console.error('Google OAuth error:', err);
      done(err, null);
    }
  }));

  console.log('Google OAuth strategy configured');
} else {
  console.log('Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required');
}

module.exports = passport;
