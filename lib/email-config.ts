import nodemailer from "nodemailer";

// GoDaddy SMTP Configuration
export const getEmailTransporter = () => {
  const port = parseInt(process.env.GODADDY_SMTP_PORT || "587");
  const secure = port === 465; // true for 465, false for 587

  return nodemailer.createTransport({
    host: process.env.GODADDY_SMTP_HOST || "smtp.secureserver.net",
    port,
    secure,
    auth: {
      user: process.env.GODADDY_EMAIL_USER,
      pass: process.env.GODADDY_EMAIL_PASSWORD,
    },
    // Allow less secure connections if needed
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const fromEmail = process.env.GODADDY_EMAIL_FROM || process.env.GODADDY_EMAIL_USER;
export const senderEmail = fromEmail ? `"Synapse - DA-IICT" <${fromEmail}>` : fromEmail;
