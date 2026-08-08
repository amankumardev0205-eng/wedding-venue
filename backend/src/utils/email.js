import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, text, html }) => {
  const smtpUrl = process.env.SMTP_URL;
  if (!smtpUrl) {
    console.warn('SMTP not configured; skipping email send');
    return null;
  }

  const transporter = nodemailer.createTransport(smtpUrl);

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@wedvenue.local',
    to,
    subject,
    text,
    html,
  });

  return info;
};
