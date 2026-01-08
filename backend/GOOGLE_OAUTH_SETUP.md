# Google OAuth Setup Guide

This guide will help you set up Google OAuth for the Digital Library application.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top and click **"New Project"**
3. Enter a project name (e.g., "Digital Library") and click **"Create"**
4. Wait for the project to be created, then select it from the dropdown

## Step 2: Configure OAuth Consent Screen

1. In the left sidebar, navigate to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** user type and click **"Create"**
3. Fill in the required fields:
   - **App name**: Digital Library
   - **User support email**: Your email address
   - **Developer contact email**: Your email address
4. Click **"Save and Continue"**
5. On the **Scopes** page, click **"Add or Remove Scopes"**
6. Select these scopes:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
   - `openid`
7. Click **"Update"** and then **"Save and Continue"**
8. On the **Test users** page, add your email as a test user (required while in testing mode)
9. Click **"Save and Continue"**, then **"Back to Dashboard"**

## Step 3: Create OAuth Credentials

1. In the left sidebar, go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. Select **"Web application"** as the application type
4. Enter a name (e.g., "Digital Library Web Client")

### For Development (localhost):

5. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:5173
   http://localhost:5000
   ```

6. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:5000/api/auth/google/callback
   ```

### For Production (Render + Netlify):

5. Under **"Authorized JavaScript origins"**, add:
   ```
   https://your-frontend-domain.netlify.app
   https://your-backend-domain.onrender.com
   ```

6. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-backend-domain.onrender.com/api/auth/google/callback
   ```

7. Click **"Create"**

## Step 4: Copy Your Credentials

After creating the OAuth client, you'll see:
- **Client ID**: Something like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: A long alphanumeric string

**Copy both values** - you'll need them for the next step.

## Step 5: Configure Environment Variables

### Local Development (.env file in /backend)

Add these to your `backend/.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here

# Session secret (generate a random string)
SESSION_SECRET=your-random-session-secret-at-least-32-chars

# JWT secret (for token generation)
JWT_SECRET=your-jwt-secret-at-least-32-characters

# Frontend URL for redirects
FRONTEND_URL=http://localhost:5173
```

### Production (Render Environment Variables)

In your Render dashboard, add these environment variables:

| Key | Value |
|-----|-------|
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `SESSION_SECRET` | A random 32+ character string |
| `JWT_SECRET` | A random 32+ character string |
| `FRONTEND_URL` | `https://your-frontend-domain.netlify.app` |

## Step 6: Install Dependencies

Run this in your backend folder:

```bash
cd backend
npm install
```

This will install:
- `passport` - Authentication middleware
- `passport-google-oauth20` - Google OAuth strategy
- `express-session` - Session handling
- `jsonwebtoken` - JWT token generation

## Step 7: Test the Integration

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend:
   ```bash
   npm run dev
   ```

3. Go to `http://localhost:5173/auth/login`
4. Click **"Sign in with Google"**
5. You should be redirected to Google's login page
6. After logging in, you'll be redirected back to your dashboard

## Troubleshooting

### "Error 400: redirect_uri_mismatch"
- Make sure the redirect URI in Google Console exactly matches your backend callback URL
- Check for trailing slashes - `http://localhost:5000/api/auth/google/callback` vs `http://localhost:5000/api/auth/google/callback/`

### "Error 403: access_denied"
- If in testing mode, make sure your Google account is added as a test user in the OAuth consent screen

### "Google OAuth is not configured" error
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in your `.env` file
- Restart your backend server after adding environment variables

### User not being saved/created
- Check MongoDB connection
- Check backend console for errors

## Security Notes

1. **Never commit your credentials** - Keep `.env` files out of version control
2. **Use strong secrets** - Generate random strings for `SESSION_SECRET` and `JWT_SECRET`
3. **Verify domains** - Google may require domain verification for production apps
4. **Publish your app** - Move from "Testing" to "Production" in OAuth consent screen when ready for public use

## URLs Summary

### Authorized JavaScript Origins:

**Development:**
- `http://localhost:5173`
- `http://localhost:5000`

**Production:**
- `https://thedigitallibrarynewapp.netlify.app` (or your Netlify domain)
- `https://your-backend.onrender.com` (your Render domain)

### Authorized Redirect URIs:

**Development:**
- `http://localhost:5000/api/auth/google/callback`

**Production:**
- `https://your-backend.onrender.com/api/auth/google/callback`

---

## Quick Start Checklist

- [ ] Created Google Cloud project
- [ ] Configured OAuth consent screen
- [ ] Created OAuth credentials
- [ ] Added authorized origins and redirect URIs
- [ ] Copied Client ID and Client Secret
- [ ] Added environment variables to `.env`
- [ ] Installed npm dependencies (`npm install`)
- [ ] Restarted backend server
- [ ] Tested login flow
