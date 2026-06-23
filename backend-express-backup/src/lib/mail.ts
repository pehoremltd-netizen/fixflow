import nodemailer from "nodemailer";
import { config } from "../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

function buildMessage(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string,
) {
  return {
    from: `"FixFlow" <${config.smtpFrom}>`,
    to,
    subject,
    text: textBody,
    html: htmlBody,
    headers: {
      "X-Mailer": "FixFlow CMMS",
      "List-Unsubscribe": `<${config.frontendUrl}/settings>`,
    },
  };
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  email: string,
  tempPassword: string,
  resetToken: string,
): Promise<void> {
  const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;

  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;">
  <div style="background:#D4AF37;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:20px;color:#000;">FixFlow CMMS</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#333;">Facility Management Platform</p>
  </div>
  <div style="background:#fff;padding:20px;border:1px solid #e0e0e0;border-top:0;border-radius:0 0 8px 8px;">
    <h2 style="margin:0 0 12px;font-size:16px;color:#111;">Hello ${name},</h2>
    <p style="font-size:13px;color:#444;line-height:1.4;">Your FixFlow account has been created.</p>
    <table style="background:#f8f8f8;border-radius:6px;padding:12px;margin:12px 0;width:100%;">
      <tr><td style="font-size:12px;color:#666;padding:4px 8px;">Email</td></tr>
      <tr><td style="font-size:14px;color:#111;font-weight:600;padding:0 8px 8px;font-family:monospace;">${email}</td></tr>
      <tr><td style="font-size:12px;color:#666;padding:4px 8px;border-top:1px solid #e0e0e0;">Temporary Password</td></tr>
      <tr><td style="font-size:14px;color:#111;font-weight:600;padding:0 8px 8px;font-family:monospace;">${tempPassword}</td></tr>
    </table>
    <p style="font-size:12px;color:#cc3333;">This password expires in 24 hours. Please reset it before logging in.</p>
    <div style="text-align:center;margin:16px 0;">
      <a href="${resetLink}" style="display:inline-block;background:#D4AF37;color:#000;text-decoration:none;padding:10px 28px;border-radius:6px;font-size:13px;font-weight:600;">Set Your Password</a>
    </div>
    <p style="font-size:12px;color:#888;">Or paste this in your browser:<br><span style="font-size:11px;color:#aaa;word-break:break-all;">${resetLink}</span></p>
    <p style="font-size:12px;color:#888;">Sign in at <a href="${config.frontendUrl}/login" style="color:#D4AF37;">${config.frontendUrl}/login</a></p>
  </div>
  <p style="font-size:11px;color:#aaa;text-align:center;margin-top:12px;">FixFlow &mdash; Enterprise CMMS</p>
</div>`;

  const text = `Hello ${name},

Your FixFlow account has been created.

Email: ${email}
Temporary Password: ${tempPassword}

This password expires in 24 hours. Please reset it before logging in.

Set your password here: ${resetLink}

Sign in at: ${config.frontendUrl}/login

---
FixFlow - Enterprise CMMS`;

  await transporter.sendMail(buildMessage(to, "Welcome to FixFlow - Set Your Password", html, text));
}

export async function sendAdminConfirmation(
  to: string,
  newUserName: string,
  newUserEmail: string,
  newUserRole: string,
): Promise<void> {
  const html = `
<div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;">
  <div style="background:#D4AF37;padding:20px;text-align:center;border-radius:8px 8px 0 0;">
    <h1 style="margin:0;font-size:20px;color:#000;">FixFlow CMMS</h1>
    <p style="margin:4px 0 0;font-size:13px;color:#333;">Admin Notification</p>
  </div>
  <div style="background:#fff;padding:20px;border:1px solid #e0e0e0;border-top:0;border-radius:0 0 8px 8px;">
    <h2 style="margin:0 0 12px;font-size:16px;color:#111;">New User Created</h2>
    <p style="font-size:13px;color:#444;line-height:1.4;">A new user was added to your FixFlow organization:</p>
    <table style="background:#f8f8f8;border-radius:6px;padding:12px;margin:12px 0;width:100%;">
      <tr><td style="font-size:12px;color:#666;padding:4px 8px;width:80px;">Name</td><td style="font-size:13px;color:#111;font-weight:600;padding:4px 8px;">${newUserName}</td></tr>
      <tr><td style="font-size:12px;color:#666;padding:4px 8px;border-top:1px solid #e0e0e0;">Email</td><td style="font-size:13px;color:#111;font-weight:600;padding:4px 8px;border-top:1px solid #e0e0e0;">${newUserEmail}</td></tr>
      <tr><td style="font-size:12px;color:#666;padding:4px 8px;border-top:1px solid #e0e0e0;">Role</td><td style="font-size:13px;color:#111;font-weight:600;padding:4px 8px;text-transform:capitalize;border-top:1px solid #e0e0e0;">${newUserRole}</td></tr>
    </table>
    <p style="font-size:13px;color:#666;">A welcome email with login instructions was sent to ${newUserEmail}.</p>
  </div>
  <p style="font-size:11px;color:#aaa;text-align:center;margin-top:12px;">FixFlow &mdash; Enterprise CMMS</p>
</div>`;

  const text = `New User Created

A new user was added to your FixFlow organization:

Name: ${newUserName}
Email: ${newUserEmail}
Role: ${newUserRole}

A welcome email with login instructions was sent to ${newUserEmail}.

---
FixFlow - Enterprise CMMS`;

  await transporter.sendMail(buildMessage(to, "New User Created - FixFlow Notification", html, text));
}
