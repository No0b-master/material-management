import cron from 'node-cron';
import { getKnex } from '../db/knex';
import dayjs from 'dayjs';
import { sendEmail, emailTemplate } from '../services/mailService';

export function startReminderJob() {
  // Run hourly
  cron.schedule('0 * * * *', async () => {
    const db = getKnex();
    const cutoff = dayjs().subtract(48, 'hour').toDate();
    const pending = await db('requests').where('status','Pending').andWhere('updated_at','<', cutoff);
    for (const row of pending) {
      // Simplified: notify HODs for pending ones
      const hod = await db('users').where({ name: row.hod_name }).first();
      if (!hod?.email) continue;
      const html = emailTemplate('Reminder: MR pending approval', [
        `Request No: ${row.request_no}`,
      ]);
      await sendEmail(hod.email, `Reminder: MR ${row.request_no}`, html).catch(() => {});
    }
  });
}
