const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { checkAndUnlockAchievements } = require('../services/achievementService');
const { sendWelcomeEmail } = require('../services/emailService');

passport.serializeUser((user, done) => {
  console.log('Serializing user:', user._id || user.id);
  done(null, user._id || user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    console.log('Deserializing user:', id);
    const user = await User.findById(id);
    if (!user) {
      console.log('User not found during deserialization:', id);
      return done(null, false);
    }
    done(null, user);
  } catch (err) {
    console.error('Error deserializing user:', err);
    done(err, null);
  }
});

// Only configure Google strategy if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://digital-library-fqqr.onrender.com/api/auth/google/callback'
      : 'http://localhost:5000/api/auth/google/callback');

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback for profile:', profile.id, profile.emails?.[0]?.value);
      
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });
      
      if (user) {
        console.log('Existing Google user found:', user.email);
        return done(null, user);
      }

      // Check if user exists with same email
      const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      if (email) {
        user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
          // Link Google account to existing user
          console.log('Linking Google account to existing user:', user.email);
          user.googleId = profile.id;
          if (!user.avatarUrl && profile.photos && profile.photos[0]) {
            user.avatarUrl = profile.photos[0].value;
          }
          user.isVerified = true; // Auto-verify when linking Google
          await user.save();
          return done(null, user);
        }
      }

      // Create new user
      console.log('Creating new Google user:', email);
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
      console.log('New Google user created:', newUser.email, newUser._id);

      // Send welcome email for newly created Google user
      try {
        await sendWelcomeEmail(newUser.email, newUser.name, true);
      } catch (mailErr) {
        console.error('Welcome email failed for Google user:', mailErr.message);
      }

      // Unlock "The Initiate" achievement for creating an account
      try {
        await checkAndUnlockAchievements(newUser._id, 'signup');
      } catch (achErr) {
        console.error('Achievement check failed:', achErr.message);
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
