const nodemailer = require('nodemailer');

let transporter = null;

/**
 * A pooled transporter created once per process. Building a new one per email
 * meant a fresh TCP + TLS handshake on every OTP — slow, and it can trip
 * provider connection-rate limits during a burst.
 */
function getTransporter() {
  if (transporter) return transporter;

  const port = parseInt(process.env.SMTP_PORT, 10) || 587;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: port === 465, // implicit TLS on 465, STARTTLS elsewhere
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 20_000,
  });

  return transporter;
}

const sendEmail = async (options) => {
  if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    throw new Error('SMTP credentials are not configured (SMTP_EMAIL / SMTP_PASSWORD)');
  }

  await getTransporter().sendMail({
    // Honour EMAIL_FROM, which .env.example documents but the previous
    // hardcoded template ignored.
    from: process.env.EMAIL_FROM || `CareerLens <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  });
};

/** Close pooled connections during graceful shutdown. */
const closeEmailTransport = () => {
  if (transporter) {
    transporter.close();
    transporter = null;
  }
};

module.exports = sendEmail;
module.exports.closeEmailTransport = closeEmailTransport;
