const nodemailer = require("nodemailer");

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
} else {
  // transporter remains null - we'll fallback to logging links for dev
}

async function sendVerificationEmail(to, link) {
  const subject = "Verify your Digital Library account";
  // link may be a URL or an object { link, code }
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
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 300; color: #2c3e50;">Email Verification</h1>
                            <p style="margin: 0; color: #7f8c8d; font-size: 16px;">Digital Library Account Activation</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 40px 30px 40px;">
                            <p style="margin: 0 0 20px 0; font-size: 16px; color: #555;">Thank you for creating an account with <strong style="color: #2c3e50;">Digital Library</strong>. To complete your registration, please use the verification code below:</p>
                            
                            <!-- Verification Code -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 40px auto; text-align: center;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 3px; border-radius: 10px;">
                                        <div style="background-color: #ffffff; padding: 30px 40px; border-radius: 8px;">
                                            <p style="margin: 0 0 15px 0; font-size: 14px; color: #7f8c8d; font-weight: 500;">YOUR VERIFICATION CODE</p>
                                            <div style="font-size: 42px; font-weight: 700; letter-spacing: 8px; color: #2c3e50; font-family: 'Courier New', monospace; padding: 10px; background-color: #f8f9fa; border-radius: 6px; border: 1px dashed #e0e0e0;">${
                                              link.code
                                            }</div>
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 25px 0 15px 0; font-size: 15px; color: #555;">Enter this code on the verification page to activate your account and access our digital collection.</p>

                            <!-- Security Notice -->
                            <div style="background-color: #fffaf3; border-left: 4px solid #ffa000; padding: 16px; margin: 25px 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; color: #7d6608;">
                                    <strong>Security Notice:</strong> This code will expire in 10 minutes for your protection.
                                </p>
                            </div>

                            <!-- Alternative Method -->
                            <div style="background-color: #f0f7ff; border-left: 4px solid #3498db; padding: 16px; margin: 25px 0; border-radius: 4px;">
                                <p style="margin: 0 0 10px 0; font-size: 14px; color: #2c3e50; font-weight: 500;">Prefer one-click verification?</p>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 10px 0;">
                                    <tr>
                                        <td style="background-color: #3498db; border-radius: 5px;">
                                            <a href="${
                                              link.link
                                            }" style="background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: 600; font-size: 14px;">Verify Automatically</a>
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px 40px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 15px 0; font-size: 12px; color: #95a5a6; text-align: center; line-height: 1.5;">
                                If you did not request this verification code, please disregard this email.<br>
                                For security reasons, do not share this code with anyone.
                            </p>
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
</html>
  `;
  } else {
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
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #f0f0f0;">
                            <h1 style="margin: 0 0 10px 0; font-size: 28px; font-weight: 300; color: #2c3e50;">Verify Your Email</h1>
                            <p style="margin: 0; color: #7f8c8d; font-size: 16px;">Activate Your Digital Library Account</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 40px 30px 40px;">
                            <p style="margin: 0 0 25px 0; font-size: 16px; color: #555;">Welcome to <strong style="color: #2c3e50;">Digital Library</strong>! Thank you for creating an account. Please verify your email address to access our complete collection of digital resources.</p>
                            
                            <!-- Primary CTA -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 30px auto; text-align: center;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 6px;">
                                        <a href="${link}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600; font-size: 16px; font-family: 'Segoe UI', sans-serif;">Verify Email Address</a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 20px 0; font-size: 14px; color: #7f8c8d; text-align: center;">
                                This verification link expires in 24 hours
                            </p>

                            <!-- Manual URL Section -->
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0; border: 1px solid #e9ecef;">
                                <p style="margin: 0 0 12px 0; font-size: 14px; color: #495057; font-weight: 500;">Alternatively, copy and paste this URL into your browser:</p>
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                    <tr>
                                        <td style="background-color: #ffffff; padding: 12px 16px; border-radius: 4px; border: 1px solid #dee2e6;">
                                            <p style="margin: 0; word-break: break-all; font-family: 'Courier New', monospace; font-size: 13px; color: #2c3e50; line-height: 1.4;">${link}</p>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Security Note -->
                            <div style="background-color: #f0f7ff; border-left: 4px solid #3498db; padding: 16px; margin: 20px 0 0 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 14px; color: #2c3e50;">
                                    <strong>Note:</strong> For your security, please do not share this verification link with anyone.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px 40px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
                            <p style="margin: 0 0 15px 0; font-size: 12px; color: #95a5a6; text-align: center; line-height: 1.5;">
                                If you did not create an account with Digital Library, please disregard this email.<br>
                                No further action is required on your part.
                            </p>
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
</html>
  `;
  }

  if (!transporter) {
    // No SMTP configured – log to console for development
    console.log("====== VERIFICATION EMAIL (no SMTP configured) ======");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    console.log("=====================================================");
    return;
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
}

module.exports = { sendVerificationEmail };

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
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : null;

    const actionDetails = {
        banned: {
            title: 'Account Deactivated',
            icon: '🔒',
            description: 'Your Digital Library account has been permanently deactivated.',
            color: '#DC2626'
        },
        suspended: {
            title: 'Account Suspended',
            icon: '⏸️',
            description: `Your Digital Library account has been temporarily suspended until ${prettyUntil}.`,
            color: '#D97706'
        },
        deleted: {
            title: 'Account Removed',
            icon: '🗑️',
            description: 'Your Digital Library account has been permanently removed from our system.',
            color: '#57534E'
        },
        restored: {
            title: 'Account Restored',
            icon: '✅',
            description: 'Your Digital Library account access has been successfully restored.',
            color: '#059669'
        }
    };

    const currentAction = actionDetails[action] || actionDetails.banned;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${subject}</title>
    <style>
        @media only screen and (max-width: 600px) {
            .container {
                width: 100% !important;
                margin: 0 !important;
                padding: 12px !important;
            }
            .content {
                padding: 20px !important;
            }
            .header {
                padding: 24px 20px !important;
            }
        }
    </style>
</head>
<body style="font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; min-height: 100vh;">
    <div class="container" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e6edf3; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div class="header" style="padding: 32px; background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #ffffff; text-align: center;">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.1); padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                <span style="font-size: 24px;">${currentAction.icon}</span>
            </div>
            <h1 style="margin: 0 0 8px 0; font-weight: 700; font-size: 24px; letter-spacing: -0.5px;">Digital Library</h1>
            <p style="margin: 0; opacity: 0.9; font-size: 14px;">Account Administration</p>
        </div>

        <!-- Content -->
        <div class="content" style="padding: 32px;">
            <!-- Status Badge -->
            <div style="display: inline-flex; align-items: center; background: ${currentAction.color}15; color: ${currentAction.color}; padding: 8px 16px; border-radius: 20px; border: 1px solid ${currentAction.color}30; margin-bottom: 24px;">
                <span style="font-size: 16px; margin-right: 8px;">${currentAction.icon}</span>
                <span style="font-weight: 600; font-size: 14px;">${currentAction.title}</span>
            </div>

            <!-- Greeting -->
            <h2 style="margin: 0 0 16px 0; font-weight: 600; font-size: 20px; color: #1e293b;">
                Hello${userName ? `, ${userName}` : ''}
            </h2>

            <!-- Main Message -->
            <p style="color: #475569; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
                ${currentAction.description}
            </p>

            <!-- Reason Section -->
            ${reason ? `
            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid ${currentAction.color}; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-weight: 600; font-size: 16px; color: #1e293b;">
                    📋 Action Details
                </h3>
                <p style="margin: 0; color: #475569; line-height: 1.5; font-size: 14px;">
                    ${reason}
                </p>
            </div>
            ` : ''}

            <!-- Suspension Details -->
            ${action === 'suspended' && prettyUntil ? `
            <div style="background: #fffbeb; padding: 20px; border-radius: 12px; border: 1px solid #fef3c7; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-weight: 600; font-size: 16px; color: #92400e;">
                    ⏰ Suspension Period
                </h3>
                <p style="margin: 0; color: #92400e; font-weight: 600; font-size: 15px;">
                    Until: ${prettyUntil}
                </p>
            </div>
            ` : ''}

            <!-- Appeal Instructions -->
            ${appealInstructions ? `
            <div style="background: #ecfdf5; padding: 20px; border-radius: 12px; border: 1px solid #a7f3d0; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-weight: 600; font-size: 16px; color: #065f46;">
                    📝 Appeal Process
                </h3>
                <p style="margin: 0; color: #065f46; line-height: 1.5; font-size: 14px;">
                    ${appealInstructions}
                </p>
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background: #f1f5f9; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-weight: 600; font-size: 16px; color: #1e293b;">
                    ℹ️ What This Means
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #475569; line-height: 1.6; font-size: 14px;">
                    ${action === 'banned' ? `
                    <li>You can no longer access your account or library resources</li>
                    <li>All borrowed materials should be returned immediately</li>
                    <li>This action is permanent and cannot be reversed</li>
                    ` : action === 'suspended' ? `
                    <li>Your account access is temporarily restricted</li>
                    <li>You cannot borrow new materials during this period</li>
                    <li>Access will be automatically restored after ${prettyUntil}</li>
                    ` : action === 'deleted' ? `
                    <li>Your account and all associated data have been removed</li>
                    <li>This action is permanent and cannot be undone</li>
                    <li>You may create a new account in the future if eligible</li>
                    ` : action === 'restored' ? `
                    <li>Full account access has been restored</li>
                    <li>You can now borrow materials and use all library services</li>
                    <li>Welcome back to the Digital Library community</li>
                    ` : `
                    <li>Your account status has been updated</li>
                    <li>Please contact support for more information</li>
                    `}
                </ul>
            </div>

            <!-- Admin Info -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">
                    <strong>Actioned by:</strong> ${adminName || 'Library Administration'}
                </p>
                ${action !== 'deleted' ? `
                <p style="margin: 0; color: #64748b; font-size: 14px;">
                    <strong>Reference ID:</strong> DL-${Date.now().toString(36).toUpperCase()}
                </p>
                ` : ''}
            </div>
        </div>

        <!-- Footer -->
        <div style="padding: 24px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center;">
            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                If you believe this action was taken in error, please contact our support team immediately.
            </p>
            <div style="margin: 16px 0;">
                <a href="mailto:support@digitallibrary.org" style="display: inline-block; background: #1e293b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; transition: background 0.2s;">
                    📧 Contact Support
                </a>
            </div>
            <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px;">
                This is an automated message from Digital Library. Please do not reply to this email.<br>
                &copy; ${new Date().getFullYear()} Digital Library. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

    if (!transporter) {
        console.log('====== ACCOUNT ACTION EMAIL (no SMTP configured) ======');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log('HTML content would be sent with account action details');
        console.log('=====================================================');
        return;
    }

    await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
    });
}

module.exports = { sendVerificationEmail, sendAccountActionEmail };