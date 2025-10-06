const nodemailer = require('nodemailer');
const { smtp } = require('../config/env');

const transporter = nodemailer.createTransport({
  host: smtp.host,
  port: smtp.port,
  secure: smtp.port === 465,
  auth: smtp.auth,
});

async function sendMail({ to, subject, text, html }) {
  const info = await transporter.sendMail({ from: smtp.from, to, subject, text, html });
  return info;
}

module.exports = { sendMail };
