import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { recordAuditEvent } from '../middleware/audit.js';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : null);
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    try {
      transporter = nodemailer.createTransport({
        host: host || 'smtp.gmail.com',
        port: port,
        secure: port === 465,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });
      console.log('[mailer] SMTP mail transport configured successfully for:', user);
    } catch (e) {
      console.warn('[mailer] Failed to initialize nodemailer transporter:', e.message);
      transporter = null;
    }
  }

  return transporter;
}

/**
 * Sends an email notification to the Admin when a viewer registers or logs in.
 */
export async function sendViewerNotification({
  type = 'LOGIN', // 'LOGIN' | 'REGISTER'
  viewerEmail,
  viewerName = 'Guest Viewer',
  method = 'email_password', // 'google' | 'email_password' | 'guest'
  ip = 'Unknown IP',
  userAgent = 'Unknown Client',
  req = null
}) {
  const adminEmail = env.ADMIN_EMAIL || 'emaanhumayun23072@gmail.com';
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const subjectPrefix = type === 'REGISTER' ? '🆕 New Viewer Registered' : '👁️ Viewer Logged In';
  const subject = `${subjectPrefix}: ${viewerEmail} - Engineering Hub`;

  const dashboardUrl = `${env.CLIENT_ORIGIN || 'http://localhost:5173'}/admin/super`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #faf8f5; color: #291b15; margin: 0; padding: 24px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #ebd9c8; box-shadow: 0 4px 16px rgba(111,29,27,0.06); overflow: hidden; }
        .header { background: #6f1d1b; color: #ffffff; padding: 24px; text-align: left; }
        .header h1 { margin: 0 0 6px 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
        .header p { margin: 0; font-size: 13px; opacity: 0.9; color: #ffe6a7; }
        .content { padding: 24px; }
        .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 24px; }
        .info-table td { padding: 10px 12px; border-bottom: 1px solid #f3ebe1; font-size: 14px; }
        .info-table td.label { font-weight: 600; color: #78350f; width: 35%; background: #fdfaf6; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
        .btn { display: inline-block; background: #6f1d1b; color: #ffffff !important; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; font-size: 14px; margin-top: 8px; }
        .footer { padding: 16px 24px; background: #fbf8f5; font-size: 12px; color: #8c7a6b; border-top: 1px solid #ebd9c8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>Engineering Hub Notification</h1>
          <p>Security & Access Activity Alert</p>
        </div>
        <div class="content">
          <p style="font-size: 15px; line-height: 1.5; margin: 0 0 16px 0;">
            A user has just authenticated into your engineering workspace in <strong>Read-Only Viewer</strong> mode.
          </p>
          <table class="info-table">
            <tr>
              <td class="label">Viewer Email:</td>
              <td><strong>${viewerEmail}</strong></td>
            </tr>
            <tr>
              <td class="label">Display Name:</td>
              <td>${viewerName}</td>
            </tr>
            <tr>
              <td class="label">Activity:</td>
              <td><span class="badge">${type}</span></td>
            </tr>
            <tr>
              <td class="label">Auth Method:</td>
              <td><code>${method}</code></td>
            </tr>
            <tr>
              <td class="label">Timestamp:</td>
              <td>${timestamp}</td>
            </tr>
            <tr>
              <td class="label">IP Address:</td>
              <td>${ip}</td>
            </tr>
          </table>

          <p style="font-size: 13px; color: #6b5e52; line-height: 1.4;">
            As workspace owner, you have full control. If you do not recognize this visitor or wish to revoke their access, you can remove or disable their account instantly from the Super Admin Control Center:
          </p>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${dashboardUrl}" class="btn">Open Super Admin Control Center &rarr;</a>
          </div>
        </div>
        <div class="footer">
          Engineering Hub Pro &bull; Automated Security Dispatcher &bull; Workspace Authority
        </div>
      </div>
    </body>
    </html>
  `;

  // Always log to audit trail
  try {
    await recordAuditEvent({
      action: `VIEWER_${type}`,
      actorEmail: viewerEmail,
      actorRole: 'viewer',
      targetResource: 'Workspace',
      targetId: viewerEmail,
      details: {
        viewerEmail,
        viewerName,
        method,
        ip,
        userAgent,
        notifiedAdmin: adminEmail
      },
      req
    });
  } catch (auditErr) {
    console.error('[mailer] Audit log error:', auditErr.message);
  }

  // Attempt real email delivery if transporter configured
  const mailTransport = getTransporter();
  if (mailTransport) {
    try {
      const info = await mailTransport.sendMail({
        from: `"Engineering Hub Alert" <${process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || adminEmail}>`,
        to: adminEmail,
        subject,
        html: htmlContent,
        text: `Engineering Hub Alert: A viewer has logged in with email ${viewerEmail} (${viewerName}) via ${method} at ${timestamp}. Manage or remove user at ${dashboardUrl}`
      });
      console.log(`[mailer] Notification email successfully sent to ${adminEmail} (Msg ID: ${info.messageId})`);
      return { sent: true, messageId: info.messageId };
    } catch (sendErr) {
      console.warn(`[mailer] Could not send email to ${adminEmail}:`, sendErr.message);
      return { sent: false, error: sendErr.message };
    }
  } else {
    // Print clear visual banner to terminal so it's transparent in dev / preview
    console.log('\n================================================================');
    console.log(`🔔 [VIEWER NOTIFICATION DISPATCH]`);
    console.log(`To Admin: ${adminEmail}`);
    console.log(`Event: ${type}`);
    console.log(`Viewer: ${viewerEmail} (${viewerName})`);
    console.log(`Auth Method: ${method}`);
    console.log(`Time: ${timestamp}`);
    console.log(`(Add SMTP_USER & SMTP_PASS in .env to deliver real emails to inbox)`);
    console.log('================================================================\n');
    return { sent: false, simulated: true };
  }
}
