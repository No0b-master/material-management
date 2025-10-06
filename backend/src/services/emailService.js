const nodemailer = require('nodemailer');
const env = require('../config/env');
const knex = require('../config/db');

let transporter;
function getTransporter() {
  if (!transporter) {
    if (env.nodeEnv === 'test') {
      transporter = nodemailer.createTransport({ jsonTransport: true });
    } else {
      transporter = nodemailer.createTransport({
        host: env.smtp.host,
        port: env.smtp.port,
        secure: env.smtp.port === 465,
        auth: { user: env.smtp.user, pass: env.smtp.pass }
      });
    }
  }
  return transporter;
}

async function getKmcContactEmail() {
  const setting = await knex('settings').where({ key: 'kmc_contact_email' }).first();
  return setting?.value || env.smtp.from;
}

async function sendEmail({ to, subject, html }) {
  const t = getTransporter();
  const from = env.smtp.from;
  await t.sendMail({ from, to, subject, html });
}

async function sendApprovalNotification(level, toEmail, requestNo) {
  const subject = `MRMS: Request ${requestNo} awaiting your approval (L${level})`;
  const html = `<p>Please review request <b>${requestNo}</b> pending at level ${level}.</p>`;
  await sendEmail({ to: toEmail, subject, html });
}

async function sendFinalApprovalEmail(requestNo) {
  const to = await getKmcContactEmail();
  const subject = `MRMS: Request ${requestNo} Approved`;
  const html = `<p>Request <b>${requestNo}</b> has been approved.</p>`;
  await sendEmail({ to, subject, html });
}

module.exports = { sendEmail, sendApprovalNotification, sendFinalApprovalEmail };
