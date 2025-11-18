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
