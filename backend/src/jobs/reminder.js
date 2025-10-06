const cron = require('node-cron');
const { knex } = require('../config/db');
const { sendMail } = require('../utils/mailer');

function startReminderJob() {
  cron.schedule('0 * * * *', async () => {
    const rows = await knex('requests')
      .whereIn('status', ['Pending','HOD Approved','PM Approved'])
      .andWhereRaw("TIMESTAMPDIFF(HOUR, updated_at, NOW()) > 48");

    for (const r of rows) {
      let to = '';
      if (r.status === 'Pending') {
        const hod = r.hod_name;
        // Simplified: send to request email for now due to lack of mapping
        to = r.email;
      } else if (r.status === 'HOD Approved') {
        to = r.email; // PM email mapping could be added
      } else if (r.status === 'PM Approved') {
        to = r.email; // Store team distribution list could be used
      }
      if (!to) continue;
      try {
        await sendMail({ to, subject: 'MRMS Reminder', text: `Reminder: Request ${r.request_no} pending action.` });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Reminder email failed', e.message);
      }
    }
  });
}

module.exports = { startReminderJob };
