const nodemailer = require('nodemailer');

// Create transporter with Mailtrap
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "098a45dde91147",
    pass: "85ccdf1f39fcaf"
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service error:', error);
  } else {
    console.log('Email service ready:', success);
  }
});

module.exports = transporter;
