const path = require('path');
const nodemailer = require('nodemailer');

// Load backend .env (assumes this script lives in backend/tools)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const to = process.env.SMTP_TEST_TO || process.env.SMTP_USER;

if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.error('Missing SMTP configuration in environment. Please set SMTP_HOST, SMTP_USER and SMTP_PASS.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function run() {
  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ SMTP connection successful');
  } catch (err) {
    console.error('❌ SMTP verification failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
    return;
  }

  // Send a small test email
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Digital Library — SMTP test',
      text: 'This is a test email sent by tools/send_test_email.js',
    });
    console.log('✉️  Test email sent, messageId:', info.messageId || info.response || info);
  } catch (err) {
    console.error('❌ Sending test email failed:', err && err.message ? err.message : err);
    process.exitCode = 1;
  }
}

run();
