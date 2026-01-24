const { sendWithProvider, isMailerReady } = require('../config/mailer');

/**
 * Service to manage all email templates and sending logic.
 */

/**
 * Send a verification email with a code or link.
 * @param {string} to - Recipient email
 * @param {Object|string} link - Either a URL string or { link, code } object
 */
async function sendVerificationEmail(to, link) {
    const subject = "Verify your Digital Library account";
    let html;
    
    if (link && typeof link === "object" && link.code) {
        html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Digital Library Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.6; background-color: #f8fafc;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
                    <tr>
                        <td style="padding: 48px 40px 32px 40px; text-align: center;">
                            <div style="width: 64px; height: 64px; background-color: #1d4ed8; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z"/>
                                </svg>
                            </div>
                            <h1 style="margin: 0 0 16px 0; font-size: 28px; font-weight: 700; color: #0f172a;">Email Verification</h1>
                            <p style="margin: 0; color: #64748b; font-size: 16px;">Digital Library Account Activation</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 40px 40px 40px;">
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #475569;">Thank you for creating an account with <strong style="color: #1d4ed8;">Digital Library</strong>. To complete your registration, please use the verification code below:</p>
                            
                            <div style="margin: 40px auto; text-align: center;">
                                <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">YOUR VERIFICATION CODE</p>
                                    <div style="font-size: 48px; font-weight: 700; letter-spacing: 12px; color: #1d4ed8; font-family: 'Courier New', monospace; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin: 0 auto; display: inline-block; min-width: 320px;">${link.code}</div>
                                </div>
                            </div>
                            
                            <p style="margin: 32px 0 16px 0; font-size: 15px; color: #475569;">Enter this code on the verification page to activate your account.</p>
                            
                            <div style="background-color: #eff6ff; border: 1px solid #dbeafe; padding: 24px; margin: 32px 0; border-radius: 8px;">
                                <p style="margin: 0 0 16px 0; font-size: 16px; color: #1e40af; font-weight: 600;">Prefer one-click verification?</p>
                                <a href="${link.link}" style="background-color: #2563eb; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-size: 16px; border: none; cursor: pointer;">Verify Automatically</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 40px 40px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
                                &copy; ${new Date().getFullYear()} Digital Library. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    } else {
        html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Verify Your Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 48px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #0f172a;">Verify Your Email</h2>
            <p style="color: #64748b; margin: 0;">Welcome to Digital Library! Click the button below to verify your email address:</p>
        </div>
        <div style="text-align: center; margin: 40px 0;">
            <a href="${link}" style="background-color: #2563eb; color: white; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; border: none; cursor: pointer; transition: background-color 0.2s;">Verify Email Address</a>
        </div>
        <p style="margin-top: 32px; font-size: 14px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 24px;">If the button doesn't work, copy this link: <span style="color: #2563eb; word-break: break-all;">${link}</span></p>
    </div>
</body>
</html>`;
    }

    return sendGenericEmail(to, subject, html);
}

/**
 * Send a Welcome email.
 * @param {string} to - Recipient email
 * @param {string} name - User's name
 * @param {boolean} isVerified - Whether the user just verified or just signed up
 */
async function sendWelcomeEmail(to, name, isVerified = false) {
    const subject = isVerified ? "Welcome to the Digital Library Family!" : "Welcome to Digital Library - One Step Left!";
    const title = isVerified ? "Account Verified Successfully!" : "Welcome to the Journey!";
    const message = isVerified 
        ? "Your account is now fully verified. You have full access to our collection of books, resources, and your personal dashboard."
        : "We are thrilled to have you here! Your journey towards endless knowledge starts now. Please verify your email to unlock all features.";
    
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 60px 0;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.08);">
                    <tr style="background-color: #1d4ed8;">
                        <td style="padding: 48px; text-align: center;">
                            <div style="width: 72px; height: 72px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                                <svg width="36" height="36" viewBox="0 0 24 24" fill="#1d4ed8" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L1 8V22H23V8L12 2ZM12 12L5 8L12 4L19 8L12 12ZM21 20H3V10L12 15L21 10V20Z"/>
                                </svg>
                            </div>
                            <h1 style="margin: 0; font-size: 36px; font-weight: 700; color: white;">Digital Library</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 48px;">
                            <h2 style="color: #1e293b; margin-top: 0; margin-bottom: 24px; font-size: 28px;">Hello ${name || 'Explorer'},</h2>
                            <p style="font-size: 20px; color: #334155; line-height: 1.6; font-weight: 600; margin-bottom: 24px;">${title}</p>
                            <p style="color: #64748b; font-size: 16px; line-height: 1.7; margin-bottom: 40px;">${message}</p>
                            
                            <div style="margin: 40px 0; padding: 28px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #1d4ed8;">
                                <p style="margin: 0 0 16px 0; font-weight: 700; color: #1e293b; font-size: 18px;">What's next?</p>
                                <ul style="margin: 0; padding-left: 24px; color: #475569; font-size: 16px; line-height: 1.8;">
                                    <li>Explore over 1000+ digital resources</li>
                                    <li>Track your reading achievements</li>
                                    <li>Build your personal library</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin-top: 48px;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #2563eb; color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; border: none; cursor: pointer; transition: background-color 0.2s;">Go to Dashboard</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px; background-color: #f8fafc; text-align: center; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0;">
                            &copy; ${new Date().getFullYear()} Digital Library. Celebrating knowledge together.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return sendGenericEmail(to, subject, html);
}

/**
 * Send an Achievement Unlocked email.
 * @param {string} to - Recipient email
 * @param {string} userName - User's name
 * @param {Object} achievement - Achievement object { title, description, points, icon }
 */
async function sendAchievementEmail(to, userName, achievement) {
    const subject = `🏆 Achievement Unlocked: ${achievement.title}!`;
    
    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 60px 0;">
        <tr>
            <td align="center">
                <table width="550" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 50px rgba(0,0,0,0.1);">
                    <tr style="background-color: #2563eb;">
                        <td style="padding: 40px; text-align: center;">
                            <div style="font-size: 64px; margin-bottom: 16px;">🏆</div>
                            <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Achievement Unlocked!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 48px; text-align: center;">
                            <p style="font-size: 20px; color: #334155; margin-bottom: 32px;">Amazing work, <strong style="color: #1d4ed8;">${userName}</strong>!</p>
                            <div style="margin: 32px auto; padding: 32px; border: 2px solid #dbeafe; border-radius: 16px; background-color: #eff6ff; max-width: 420px;">
                                <h2 style="color: #1d4ed8; margin: 0 0 16px 0; font-size: 22px;">${achievement.name || achievement.title}</h2>
                                <p style="color: #475569; font-style: italic; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">"${achievement.description}"</p>
                                <div style="display: inline-block; background-color: #1d4ed8; color: white; padding: 8px 20px; border-radius: 20px; font-weight: 600; font-size: 15px;">
                                    +${achievement.points} XP Earned
                                </div>
                            </div>
                            <p style="color: #64748b; line-height: 1.7; margin: 32px 0; font-size: 16px;">You're making incredible progress in your digital journey. Keep exploring the library to unlock even more rewards!</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/achievements" style="color: #2563eb; font-weight: 600; text-decoration: none; font-size: 16px; border-bottom: 2px solid #2563eb; padding-bottom: 4px; display: inline-block;">View All My Achievements →</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px; background-color: #f8fafc; text-align: center; color: #94a3b8; font-size: 14px; border-top: 1px solid #e2e8f0;">
                            Proudly delivered by the Digital Library Achievement System
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    return sendGenericEmail(to, subject, html);
}

/**
 * Send an account action email (banned, suspended, deleted, restored).
 * @param {string} to - Recipient email
 * @param {Object} opts - Options { action, reason, until, adminName, userName, appealInstructions }
 */
async function sendAccountActionEmail(to, opts = {}) {
    const { action, reason, until, adminName, userName, appealInstructions } = opts;
    
    const subjectMap = {
        banned: 'Account Deactivation Notice - Digital Library',
        suspended: 'Account Suspension Notice - Digital Library',
        deleted: 'Account Removal Notice - Digital Library',
        restored: 'Account Access Restored - Digital Library'
    };
    const subject = subjectMap[action] || 'Important Account Notification - Digital Library';

    const prettyUntil = until ? new Date(until).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : null;

    const actionDetails = {
        banned: { title: 'Account Deactivated', icon: '🔒', description: 'Your account has been permanently deactivated.', color: '#dc2626' },
        suspended: { title: 'Account Suspended', icon: '⏸️', description: `Your account has been temporarily suspended until ${prettyUntil}.`, color: '#d97706' },
        deleted: { title: 'Account Removed', icon: '🗑️', description: 'Your account has been permanently removed from our system.', color: '#57534e' },
        restored: { title: 'Account Restored', icon: '✅', description: 'Your account access has been successfully restored.', color: '#059669' }
    };

    const currentAction = actionDetails[action] || actionDetails.banned;

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; border-top: 4px solid ${currentAction.color}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="padding: 32px; background-color: #f8fafc; text-align: center; border-bottom: 1px solid #e2e8f0;">
            <div style="width: 64px; height: 64px; background-color: ${currentAction.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px;">
                <span style="font-size: 32px;">${currentAction.icon}</span>
            </div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #0f172a;">${currentAction.title}</h1>
        </div>
        <div style="padding: 40px;">
            <p style="margin: 0 0 24px 0; font-size: 16px; color: #334155;">Hello ${userName || 'User'},</p>
            <p style="margin: 0 0 32px 0; font-size: 16px; color: #475569;">${currentAction.description}</p>
            
            ${reason ? `
            <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;"><strong>Reason:</strong> ${reason}</p>
            </div>` : ''}
            
            ${adminName ? `<p style="margin: 0 0 16px 0; font-size: 14px; color: #64748b;"><strong>Action by:</strong> ${adminName}</p>` : ''}
            
            <p style="margin: 32px 0 0 0; font-size: 14px; color: #64748b;">If you have questions, please contact our support team.</p>
        </div>
        <div style="padding: 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} Digital Library. All rights reserved.
        </div>
    </div>
</body>
</html>`;

    return sendGenericEmail(to, subject, html);
}

/**
 * Private helper to handle the actual sending and logging
 */
async function sendGenericEmail(to, subject, html) {
    // Always try to send, even if mailer verification failed initially
    // Verification failure might be temporary (network issue, DNS delay, etc.)
    
    try {
        const info = await sendWithProvider({
            from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@digitallibrary.com',
            to,
            subject,
            html
        });
        console.log(`Email sent successfully to ${to}: ${subject}`);
        return info;
    } catch (err) {
        // If actual sending fails, log it for debugging
        console.error(`Email delivery failed to ${to}:`, err.message);
        console.log(`====== EMAIL SIMULATION (DELIVERY FAILED) ======`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content length: ${html?.length || 0} chars`);
        console.log(`Error: ${err.message}`);
        console.log(`===================================================`);
        
        // Don't throw - allow registration/verification to continue
        // even if email fails (users can still verify via code or resend)
        return { logged: true, error: err.message };
    }
}

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendAchievementEmail,
    sendAccountActionEmail
};