# Digital Library — Backend

This folder contains a minimal Express + MongoDB backend scaffold.

Quick start:

1. cd backend
2. copy `.env.example` to `.env` and update `MONGO_URI` and other vars
3. npm install
4. npm run dev

API samples:

- GET /api/health — health check
- POST /api/auth/register — register { name, email, password }
- POST /api/auth/login — login { email, password }

Notes:
- This scaffold uses mongoose for MongoDB. Add JWT handling and additional models/routes as needed.

SMTP / Gmail
---------------

To send real verification emails using a Gmail account (`dlibrarymanagement@gmail.com`):

1. Enable 2-Step Verification on the Gmail account (required).
2. Create an App Password for "Mail" (or "Other") in your Google Account security settings.
3. Set the generated app password into `backend/.env` as `SMTP_PASS` (do NOT commit this value):

	SMTP_HOST=smtp.gmail.com
	SMTP_PORT=465
	SMTP_SECURE=true
	SMTP_USER=dlibrarymanagement@gmail.com
	SMTP_PASS=<your-app-password>

When SMTP values are not present the server will log verification links to the console (safe for local development).

Production (Render) notes
-------------------------

If you host the backend on Render (or any cloud host), set the same SMTP env vars in the Render service's Environment tab. The mailer accepts either the SMTP_* names or MAILER_* names. Example environment variables to set on Render:

	SMTP_HOST=smtp.gmail.com
	SMTP_PORT=465
	SMTP_SECURE=true
	SMTP_USER=your-email@example.com
	SMTP_PASS=<your-smtp-password-or-app-password>
	SMTP_FROM="Digital Library <your-email@example.com>"

Alternatively, you can use a transactional email provider (SendGrid, Mailgun, Postmark). Many providers support SMTP (use the same SMTP_* vars) or provide an API key which you can use as the SMTP password with user 'apikey' (SendGrid).

After adding env vars on Render, redeploy the service. You can test email sending via the admin test endpoint:

	POST /api/admin/test-email  { "to": "you@example.com" }

The server will log an error if SMTP configuration fails; check Render service logs for delivery errors.
