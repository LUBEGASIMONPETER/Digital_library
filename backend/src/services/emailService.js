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
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.6; background-color: #f8f9fa;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border: 1px solid #e8e8e8;">
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 300; color: #2c3e50;">Email Verification</h1>
                            <p style="margin: 0; color: #7f8c8d; font-size: 16px;">Digital Library Account Activation</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 40px 30px 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Thank you for creating an account with <strong style="color: #2c3e50;">Digital Library</strong>. To complete your registration, please use the verification code below:</p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 40px auto; text-align: center;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3px; border-radius: 10px;">
                                        <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 8px;">
                                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #7f8c8d; font-weight: 500;">YOUR VERIFICATION CODE</p>
                                            <div style="font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #2c3e50; font-family: 'Courier New', monospace; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border: 1px dashed #e0e0e0;">${link.code}</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 25px 0 15px 0; font-size: 15px; color: #555;">Enter this code on the verification page to activate your account.</p>
                            <div style="background-color: #f0f7ff; border-left: 4px solid #3498db; padding: 16px; margin: 25px 0; border-radius: 4px;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #2c3e50; font-weight: 500;">Prefer one-click verification?</p>
                                <a href="${link.link}" style="background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600; font-size: 14px;">Verify Automatically</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px 40px 40px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0; font-size: 12px; color: #bdc3c7; text-align: center;">
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
<body style="font-family: sans-serif; background-color: #f8f9fa; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; border: 1px solid #e8e8e8;">
        <h2>Verify Your Email</h2>
        <p>Welcome to Digital Library! Click the button below to verify your email address:</p>
        <a href="${link}" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email Address</a>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">If the button doesn't work, copy this link: ${link}</p>
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
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f7f6; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <tr style="background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);">
                        <td style="padding: 40px; text-align: center; color: white;">
                            <h1 style="margin: 0; font-size: 32px;">Digital Library</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="color: #2c3e50; margin-top: 0;">Hello ${name || 'Explorer'},</h2>
                            <p style="font-size: 18px; color: #34495e; line-height: 1.6;">${title}</p>
                            <p style="color: #6d7278; font-size: 16px; line-height: 1.6;">${message}</p>
                            
                            <div style="margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #b21f1f;">
                                <p style="margin: 0; font-weight: bold; color: #2c3e50;">What's next?</p>
                                <ul style="margin: 10px 0; padding-left: 20px; color: #555;">
                                    <li>Explore over 1000+ digital resources</li>
                                    <li>Track your reading achievements</li>
                                    <li>Build your personal library</li>
                                </ul>
                            </div>

                            <div style="text-align: center; margin-top: 40px;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" style="background-color: #1a2a6c; color: white; padding: 15px 35px; text-decoration: none; border-radius: 30px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px; background-color: #f9f9f9; text-align: center; color: #95a5a6; font-size: 12px;">
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
<body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f2f5; margin: 0; padding: 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="550" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 15px 45px rgba(0,0,0,0.15);">
                    <tr style="background-color: #FFD700;">
                        <td style="padding: 30px; text-align: center;">
                            <div style="font-size: 60px; margin-bottom: 10px;">🏆</div>
                            <h1 style="margin: 0; color: #000; font-size: 26px; text-transform: uppercase; letter-spacing: 2px;">Achievement Unlocked!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px; text-align: center;">
                            <p style="font-size: 18px; color: #333;">Amazing work, <strong>${userName}</strong>!</p>
                            <div style="margin: 25px auto; padding: 25px; border: 2px dashed #FFD700; border-radius: 15px; background-color: #fffdf0; max-width: 400px;">
                                <h2 style="color: #b8860b; margin: 0 0 10px 0;">${achievement.name || achievement.title}</h2>
                                <p style="color: #666; font-style: italic; margin: 0 0 15px 0;">"${achievement.description}"</p>
                                <div style="display: inline-block; background-color: #b8860b; color: white; padding: 5px 15px; border-radius: 20px; font-weight: bold; font-size: 14px;">
                                    +${achievement.points} XP Earned
                                </div>
                            </div>
                            <p style="color: #7f8c8d; line-height: 1.6;">You're making incredible progress in your digital journey. Keep exploring the library to unlock even more rewards!</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/achievements" style="display: inline-block; margin-top: 20px; color: #b8860b; font-weight: bold; text-decoration: none; border-bottom: 2px solid #FFD700;">View All My Achievements →</a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 20px; background-color: #f8f9fa; text-align: center; color: #bdc3c7; font-size: 12px;">
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
    // Re-use existing logic from mailer.js but cleaned up
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
        banned: { title: 'Account Deactivated', icon: '🔒', description: 'Your account has been permanently deactivated.', color: '#DC2626' },
        suspended: { title: 'Account Suspended', icon: '⏸️', description: `Your account has been temporarily suspended until ${prettyUntil}.`, color: '#D97706' },
        deleted: { title: 'Account Removed', icon: '🗑️', description: 'Your account has been permanently removed from our system.', color: '#57534E' },
        restored: { title: 'Account Restored', icon: '✅', description: 'Your account access has been successfully restored.', color: '#059669' }
    };

    const currentAction = actionDetails[action] || actionDetails.banned;

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border: 1px solid #ddd; border-top: 4px solid ${currentAction.color}; border-radius: 8px; overflow: hidden;">
        <div style="padding: 20px; background: #f8f9fa; text-align: center;">
            <span style="font-size: 40px;">${currentAction.icon}</span>
            <h1 style="margin: 10px 0;">${currentAction.title}</h1>
        </div>
        <div style="padding: 30px;">
            <p>Hello ${userName || 'User'},</p>
            <p>${currentAction.description}</p>
            ${reason ? `<div style="background: #fdf2f2; padding: 15px; border-radius: 5px; margin: 20px 0;"><strong>Reason:</strong> ${reason}</div>` : ''}
            <p>If you have questions, please contact our support team.</p>
        </div>
        <div style="padding: 20px; background: #f8f9fa; border-top: 1px solid #ddd; text-align: center; font-size: 12px; color: #777;">
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
    if (!isMailerReady()) {
        console.log(`====== EMAIL SIMULATION (MAILER NOT READY) ======`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Content length: ${html?.length || 0} chars`);
        console.log(`===================================================`);
        return { logged: true };
    }

    try {
        const info = await sendWithProvider({
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to,
            subject,
            html
        });
        return info;
    } catch (err) {
        console.error(`Email delivery failed to ${to}:`, err.message);
        throw err;
    }
}

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendAchievementEmail,
    sendAccountActionEmail
};
