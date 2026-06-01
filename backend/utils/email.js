import nodemailer from 'nodemailer';

export const createTransport = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendMail = async ({ to, subject, html, text }) => {
  const transporter = createTransport();

  if (!transporter) {
    console.log('SMTP is not configured. Mail preview:', { to, subject, text });
    return { skipped: true };
  }

  return transporter.sendMail({
    from: process.env.MAIL_FROM || 'BIIT Admin <no-reply@biit.in>',
    to,
    subject,
    text,
    html
  });
};
