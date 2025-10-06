const cron = require('node-cron');
const knex = require('../config/db');
const { sendEmail } = require('../services/emailService');

async function sendReminders() {
  // Find requests where last approval (or creation) older than 48 hours and not final
  const requests = await knex('requests').whereIn('status', ['Pending','Sent Back']);
  const now = new Date();
  // Simplified: send reminder to all approvers of current level
  for (const r of requests) {
    const history = await knex('approvals').where({ request_id: r.id }).orderBy('timestamp');
    const lastEventTime = history.length ? new Date(history[history.length - 1].timestamp) : new Date(r.request_date);
    const hours = (now - lastEventTime) / 36e5;
    if (hours > 48) {
      // Determine current level
      const approvalsCount = history.filter(h => h.action === 'Approve').length;
      const currentLevel = approvalsCount + 1;
      let role = 'hod';
      if (currentLevel === 2) role = 'pm';
      if (currentLevel === 3) role = 'store';
      const approvers = await knex('users').where({ role }).select('email');
      const to = approvers.map(a => a.email).filter(Boolean);
      if (to.length > 0) {
        await sendEmail({
          to: to.join(','),
          subject: `Reminder: Request ${r.request_no} pending for ${Math.floor(hours)}h`,
          html: `<p>Request <b>${r.request_no}</b> has been pending at level ${currentLevel} for over 48 hours.</p>`
        });
      }
    }
  }
}

function schedule() {
  cron.schedule('0 * * * *', () => { // hourly
    sendReminders().catch(() => {});
  });
}

module.exports = { schedule, sendReminders };
