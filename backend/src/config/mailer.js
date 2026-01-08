const nodemailer = require('nodemailer');

let transporter = null;
let mailerReady = false;

// Support both SMTP_* and MAILER_* environment variable names to match .env.example and common conventions.
const mailHost = process.env.SMTP_HOST || process.env.MAILER_HOST || '';
const mailPort = Number(process.env.SMTP_PORT || process.env.MAILER_PORT || 0) || 587;
const mailSecure = (process.env.SMTP_SECURE || process.env.MAILER_SECURE || 'false') === 'true';
const mailUser = process.env.SMTP_USER || process.env.MAILER_USER || '';
const mailPass = process.env.SMTP_PASS || process.env.MAILER_PASS || '';
const mailFrom = process.env.SMTP_FROM || process.env.MAILER_FROM || process.env.SMTP_USER || process.env.MAILER_USER || '';

// Optional SendGrid API fallback (recommended on platforms that block SMTP)
const sendgridKey = process.env.SENDGRID_API_KEY || process.env.SENDGRID_KEY || '';
let useSendGrid = false;
let sendgrid = null;
if (sendgridKey) {
    try {
        sendgrid = require('@sendgrid/mail');
        sendgrid.setApiKey(sendgridKey);
        useSendGrid = true;
        console.log('SendGrid API configured for outgoing email');
    } catch (e) {
        console.error('SendGrid configured but @sendgrid/mail is not installed or failed to load:', e && e.message ? e.message : e);
    }
}

if (mailHost && mailUser && mailPass) {
    // Build transport options with sensible defaults and tunable env vars.
    const transportOptions = {
        host: mailHost,
        port: mailPort,
        secure: mailSecure,
        auth: {
            user: mailUser,
            pass: mailPass,
        },
        // Force STARTTLS on ports like 587 when secure is false (common setup)
        requireTLS: mailPort === 587 && !mailSecure,
        // Timeouts (ms) - can be tuned via env vars in production
        connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT) || 10000,
        greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT) || 10000,
        socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT) || 10000,
        // TLS verification toggle (useful for some providers / staging)
        tls: {
            rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === 'false' ? false : true,
        },
        // Optional pooling (disabled by default)
        pool: process.env.SMTP_POOL === 'true' || false,
    };

    transporter = nodemailer.createTransport(transportOptions);

    // Verify transporter connectivity asynchronously and record status
    transporter.verify()
        .then(() => {
            mailerReady = true
            console.log('Mailer transporter verified')
        })
        .catch(err => {
            mailerReady = false
            console.error('Mailer transporter verification failed:', err && err.message ? err.message : err)
            try {
                const debug = require('./debugStore')
                debug.setLastError(err)
            } catch (e) {}
        })
} else {
    // transporter remains null - we'll fallback to logging links for dev
}

// Helper to send via configured provider (SendGrid preferred if available)
async function sendWithProvider({ from, to, subject, html, text }) {
    if (useSendGrid && sendgrid) {
        // sendgrid.send returns an array of responses; normalize
        const msg = { to, from, subject };
        if (html) msg.html = html;
        if (text) msg.text = text;
        try {
            const res = await sendgrid.send(msg);
            return res;
        } catch (err) {
            console.error('SendGrid send failed:', err && err.message ? err.message : err);
            throw err;
        }
    }

    if (!transporter) {
        const err = new Error('No SMTP transporter configured');
        console.error('No transporter available to send email');
        throw err;
    }
    try {
        const info = await transporter.sendMail({ from, to, subject, html, text });
        return info;
    } catch (err) {
        console.error('SMTP send failed:', err && err.message ? err.message : err);
        throw err;
    }
}

module.exports = { 
    sendWithProvider, 
    isMailerReady: () => mailerReady 
};