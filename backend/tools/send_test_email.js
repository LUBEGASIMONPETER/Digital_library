const path = require('path');

// Load backend .env (assumes this script lives in backend/tools)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const to = process.env.SMTP_TEST_TO || process.env.SMTP_USER || process.env.SMTP_FROM || 'test@example.com';

// Check if SendGrid is configured
const sendgridKey = process.env.SENDGRID_API_KEY || process.env.SENDGRID_KEY;
const useSendGrid = !!sendgridKey;

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📧 Email Configuration Test');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

if (useSendGrid) {
  console.log('✅ Using SendGrid API');
  console.log(`   API Key: ${sendgridKey.substring(0, 10)}...`);
  console.log(`   From: ${process.env.SMTP_FROM || 'NOT SET'}`);
  console.log(`   To: ${to}`);
  console.log('');
  testSendGrid();
} else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log('✅ Using SMTP');
  console.log(`   Host: ${process.env.SMTP_HOST}`);
  console.log(`   Port: ${process.env.SMTP_PORT || 587}`);
  console.log(`   User: ${process.env.SMTP_USER}`);
  console.log(`   From: ${process.env.SMTP_FROM || process.env.SMTP_USER}`);
  console.log(`   To: ${to}`);
  console.log('');
  testSMTP();
} else {
  console.error('❌ No email configuration found!');
  console.error('');
  console.error('Please set either:');
  console.error('  1. SENDGRID_API_KEY + SMTP_FROM (recommended for production)');
  console.error('  2. SMTP_HOST + SMTP_USER + SMTP_PASS (for local testing)');
  console.error('');
  process.exit(1);
}

// ═══════════════════════════════════════════════════════════
// SendGrid Test
// ═══════════════════════════════════════════════════════════
async function testSendGrid() {
  try {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(sendgridKey);

    const from = process.env.SMTP_FROM;
    if (!from) {
      console.error('❌ SMTP_FROM is required for SendGrid');
      console.error('   This must be a verified sender in SendGrid');
      process.exit(1);
    }

    console.log('🔄 Sending test email via SendGrid...');
    console.log('');

    const msg = {
      to,
      from,
      subject: 'Digital Library — SendGrid Test ✅',
      text: 'This is a test email sent by tools/send_test_email.js using SendGrid API',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>SendGrid Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2c3e50; margin: 0 0 20px 0;">✅ SendGrid Test Successful!</h1>
            <p style="color: #555; line-height: 1.6;">
              This test email confirms that your SendGrid integration is working correctly.
            </p>
            <div style="background: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db;">
              <p style="margin: 0; color: #2c3e50;">
                <strong>Sent by:</strong> tools/send_test_email.js<br>
                <strong>Method:</strong> SendGrid API<br>
                <strong>Status:</strong> Production Ready ✅
              </p>
            </div>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
              Digital Library Email System
            </p>
          </div>
        </body>
        </html>
      `,
    };

    const response = await sgMail.send(msg);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✉️  Test email sent successfully via SendGrid!');
    console.log(`   Status: ${response[0].statusCode}`);
    console.log(`   To: ${to}`);
    console.log(`   From: ${from}`);
    console.log('');
    console.log('📬 Check your inbox for the test email.');
    console.log('');
    console.log('🎉 Your production email is ready!');
    console.log('');

  } catch (err) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ FAILED!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.error('Error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.body);
    }
    console.log('');
    console.log('Troubleshooting:');
    console.log('  1. Check your SENDGRID_API_KEY is correct');
    console.log('  2. Verify SMTP_FROM email in SendGrid dashboard');
    console.log('  3. Ensure sender is verified in SendGrid');
    console.log('  4. Check SendGrid API key permissions');
    console.log('');
    process.exitCode = 1;
  }
}

// ═══════════════════════════════════════════════════════════
// SMTP Test
// ═══════════════════════════════════════════════════════════
async function testSMTP() {
  const nodemailer = require('nodemailer');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    // Verify connection configuration
    console.log('🔄 Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    console.log('');
  } catch (err) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ SMTP Verification FAILED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.error('Error:', err.message);
    console.log('');
    console.log('⚠️  Common Issues:');
    console.log('  • Render free tier blocks SMTP ports → Use SendGrid instead');
    console.log('  • Check SMTP credentials are correct');
    console.log('  • Gmail requires app-specific password');
    console.log('  • Firewall blocking outbound connections');
    console.log('');
    console.log('💡 Recommended: Switch to SendGrid for production');
    console.log('   See: backend/PRODUCTION_EMAIL_SETUP.md');
    console.log('');
    process.exitCode = 1;
    return;
  }

  // Send a test email
  try {
    console.log('🔄 Sending test email via SMTP...');
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: 'Digital Library — SMTP Test',
      text: 'This is a test email sent by tools/send_test_email.js using SMTP',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>SMTP Test</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #2c3e50;">✅ SMTP Test Successful!</h1>
            <p style="color: #555;">This test email confirms that your SMTP configuration is working.</p>
            <p style="color: #7f8c8d; font-size: 12px; margin-top: 30px;">
              Digital Library Email System
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ SUCCESS!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✉️  Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId || 'N/A'}`);
    console.log('');
    console.log('📬 Check your inbox.');
    console.log('');
    console.log('⚠️  Note: SMTP may not work on Render free tier');
    console.log('   Consider using SendGrid for production');
    console.log('');

  } catch (err) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ FAILED to send email');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.error('Error:', err.message);
    console.log('');
    process.exitCode = 1;
  }
}
