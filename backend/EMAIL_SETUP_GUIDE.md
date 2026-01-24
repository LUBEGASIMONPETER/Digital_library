# Email Setup Guide for Digital Library

## Current Issues Fixed

This guide addresses the following issues:
1. ✅ Emails not being sent (showing "EMAIL SIMULATION (MAILER NOT READY)")
2. ✅ Google OAuth login/logout issue
3. ✅ Session configuration for production

## Email Configuration Options

### Option 1: SendGrid (RECOMMENDED for Production)

SendGrid is recommended because it:
- Works reliably on Render, Netlify, and other platforms
- Provides 100 free emails/day
- Doesn't get blocked by hosting providers
- Has better deliverability

#### Setup Steps:

1. **Create SendGrid Account**
   - Go to https://sendgrid.com/
   - Sign up for a free account
   - Verify your email

2. **Create API Key**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "Digital Library"
   - Select "Full Access"
   - Copy the API key (you'll only see it once!)

3. **Verify Sender Email**
   - Go to Settings → Sender Authentication
   - Click "Verify a Single Sender"
   - Fill in your details with the email you want to send from
   - Verify the email address

4. **Add to Environment Variables**
   ```bash
   SENDGRID_API_KEY=SG.your_api_key_here
   SMTP_FROM=your-verified-sender@example.com
   ```

### Option 2: Gmail SMTP (For Development/Local Only)

**NOTE:** Gmail SMTP will NOT work on Render free tier (ports blocked). Use SendGrid instead.

#### Setup Steps:

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2-factor authentication

2. **Create App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Digital Library"
   - Copy the 16-character password

3. **Add to Environment Variables**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-char-app-password
   SMTP_FROM=your-email@gmail.com
   ```

## Environment Variables Setup

### For Render.com:

1. Go to your service dashboard
2. Click "Environment" tab
3. Add these variables:

```bash
# Email Configuration (choose one method)
SENDGRID_API_KEY=SG.your_api_key_here
SMTP_FROM=your-verified-sender@example.com

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback

# Frontend URL
FRONTEND_URL=https://your-frontend-url.netlify.app

# Session Secret
SESSION_SECRET=your_random_secret_key_here

# JWT Secret
JWT_SECRET=your_jwt_secret_here
```

### For Local Development:

Create a `.env` file in the `backend` folder:

```bash
# Email (SendGrid)
SENDGRID_API_KEY=SG.your_api_key_here
SMTP_FROM=your-verified-sender@example.com

# Or Email (Gmail SMTP - local only)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Other settings
PORT=5000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```

## Testing Email Configuration

After setting up your email configuration, test it:

1. **Using the test script:**
   ```bash
   cd backend
   node tools/send_test_email.js
   ```

2. **Through the app:**
   - Register a new user
   - Check if verification email arrives
   - Try resending verification email

## Troubleshooting

### Emails still not sending?

1. **Check Render Logs:**
   ```
   Look for: "Mailer transporter verified" (good)
   Or: "Mailer transporter verification failed" (bad - check credentials)
   ```

2. **Verify SendGrid API Key:**
   - Make sure it starts with "SG."
   - Check it's not expired
   - Verify sender email is authenticated

3. **Check SMTP_FROM:**
   - Must match a verified sender in SendGrid
   - Must be a valid email format

4. **Port Issues:**
   - If using SMTP on Render → Switch to SendGrid
   - Render blocks SMTP ports 25, 465, 587

### Google OAuth Issues Fixed

The following changes were made:
1. ✅ Session cookie configured for cross-domain auth
2. ✅ Token immediately stored to prevent logout
3. ✅ Better error handling in OAuth callback
4. ✅ User data preserved from JWT decode

### Still Getting Logged Out?

1. **Clear Browser Cache:**
   - Clear cookies and localStorage
   - Try incognito/private mode

2. **Check Environment Variables:**
   ```bash
   FRONTEND_URL=https://your-exact-frontend-url.netlify.app
   NODE_ENV=production
   ```

3. **Verify Token in URL:**
   - After Google login, you should see `?token=...` in URL
   - Token should be saved to localStorage as `auth_user`

## Share-Modal Error Fix

The `share-modal.js` error is likely from:
1. Browser extensions (ad blockers, privacy tools)
2. Cached files from old version
3. Third-party scripts

**To fix:**
1. Clear browser cache
2. Disable browser extensions
3. Try incognito/private mode
4. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

## Verification

After setup, you should see in Render logs:
```
✅ Mailer transporter verified
✅ Google OAuth strategy configured
✅ Server running on port 5000
```

When registering a user, you should see:
```
✅ Registered user: email@example.com
✅ (Actual email sent or logged depending on config)
```

## Support

If you still have issues:
1. Check Render logs for specific errors
2. Verify all environment variables are set
3. Test with the `send_test_email.js` script
4. Check SendGrid dashboard for email activity
