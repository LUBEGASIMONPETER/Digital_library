# 📧 Production Email Setup Guide

## Problem
Render's free tier blocks outbound SMTP ports (465, 587), causing "Connection timeout" errors when using Gmail SMTP directly.

## ✅ Solution: Use SendGrid (FREE - 100 emails/day)

Your mailer is already configured to support SendGrid! You just need to set it up.

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com
2. Click "Sign Up" (Choose FREE plan - 100 emails/day)
3. Verify your email address
4. Complete the setup wizard

### Step 2: Create API Key
1. In SendGrid Dashboard, go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it: `Digital Library Production`
4. Permission Level: **Full Access** (or at least "Mail Send")
5. Click **Create & View**
6. **COPY THE API KEY** (you'll only see it once!)
   - Example: `SG.xxxxxxxxxxxxxxxxxx.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`

### Step 3: Verify Sender Identity
⚠️ **IMPORTANT**: SendGrid requires sender verification

#### Option A: Single Sender Verification (Quick - Recommended for Free Tier)
1. Go to **Settings** → **Sender Authentication** → **Single Sender Verification**
2. Click **Create New Sender**
3. Fill in your details:
   - **From Name**: Digital Library
   - **From Email Address**: YOUR_GMAIL@gmail.com (the one you want to send from)
   - **Reply To**: Same as above
   - **Company Address**: Your address
4. Click **Create**
5. Check your email and **verify the sender**

#### Option B: Domain Authentication (Better for custom domains)
- Only if you have a custom domain
- Follow SendGrid's domain authentication guide

### Step 4: Update Render Environment Variables

1. Go to your Render dashboard: https://dashboard.render.com
2. Select your backend service: `digital-library-fqqr`
3. Go to **Environment** tab
4. Add these environment variables:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_actual_api_key_here
SMTP_FROM=your-verified-email@gmail.com

# Optional: Keep existing SMTP vars commented out or remove them
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASS=
```

5. Click **Save Changes**
6. Render will automatically redeploy

---

## 🧪 Testing

### Test 1: Check Logs After Deploy
After deployment, your logs should show:
```
SendGrid API configured for outgoing email
```

Instead of:
```
Mailer transporter verification failed: Connection timeout
```

### Test 2: Register a Test User
1. Go to your frontend: https://thedigitallibrarynewapp.netlify.app
2. Try registering with a real email address
3. Check your inbox for the verification email
4. Verify it works!

### Test 3: Manual Test Script
Run this from your local backend:

```bash
cd /Users/user/Desktop/Digital_library/backend
# Set environment variables temporarily
export SENDGRID_API_KEY="your_api_key_here"
export SMTP_FROM="your-verified-email@gmail.com"
# Run test script
node tools/send_test_email.js
```

---

## 📊 Alternative Options

### Option 2: Resend (Modern Alternative)
- Free: 100 emails/day, 3,000/month
- Simpler API than SendGrid
- Website: https://resend.com

Setup:
```bash
npm install resend
# Get API key from resend.com
# Add to Render: RESEND_API_KEY=re_xxxxx
```

### Option 3: Mailgun
- Free: 100 emails/day for 3 months
- Website: https://www.mailgun.com

### Option 4: AWS SES
- Free: 62,000 emails/month (if sending from EC2/Lambda)
- More complex setup
- Requires AWS account

### Option 5: Render Paid Plan ($7/month)
- Upgrades unblock SMTP ports
- Then Gmail SMTP would work directly

---

## 🔍 Troubleshooting

### "Sender not verified" Error
- Make sure you verified the sender email in SendGrid
- The `SMTP_FROM` email must match the verified sender

### "API Key Invalid" Error
- Double-check the SendGrid API key
- Make sure you copied it correctly
- API keys start with `SG.`

### Emails Going to Spam
1. In SendGrid, set up **Domain Authentication**
2. Add SPF/DKIM records to your DNS (if you have a domain)
3. Start with low volume to build reputation

### Still Getting "Connection timeout"
- Make sure `SENDGRID_API_KEY` is set in Render environment
- Check that `@sendgrid/mail` package is installed
- View Render logs for errors

### Test email works but registration doesn't
- Check your MongoDB connection
- Check Render logs for other errors
- Verify frontend is pointing to correct backend URL

---

## 📝 Current Code Status

✅ Your `mailer.js` is ALREADY configured to support SendGrid!

The code automatically detects SendGrid API key:
- If `SENDGRID_API_KEY` is set → Uses SendGrid
- If not → Falls back to SMTP (which fails on Render free tier)

No code changes needed! Just set the environment variables.

---

## 🎯 Recommended Next Steps

1. ✅ Create SendGrid account (FREE)
2. ✅ Get API key
3. ✅ Verify sender email
4. ✅ Add to Render environment variables
5. ✅ Test registration flow
6. ✅ Monitor SendGrid dashboard for email stats

---

## 💡 Production Best Practices

### Email Templates
Your current templates are great! They include:
- ✅ Verification code
- ✅ One-click verification link
- ✅ Professional HTML design
- ✅ Responsive layout

### Monitoring
- Check SendGrid dashboard for delivery rates
- Monitor for bounces and spam reports
- Set up webhook for email events (optional)

### Rate Limits
Free tier: 100 emails/day
- Perfect for development and small-scale production
- Upgrade to paid if you need more

### Security
- Never commit API keys to git (already in .gitignore)
- Use environment variables only
- Rotate API keys periodically

---

## 📞 Support

### SendGrid Support
- Documentation: https://docs.sendgrid.com
- Support: https://support.sendgrid.com

### Your Application
- Check Render logs for errors
- Test locally first with environment variables
- Use `tools/send_test_email.js` for testing

---

**Last Updated**: December 2025
**Status**: ✅ @sendgrid/mail package installed and ready
