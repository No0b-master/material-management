import { Request, Response } from 'express';
import dayjs from 'dayjs';
import { getKnex } from '../db/knex';
import { emailTemplate, sendEmail } from '../services/mailService';
import { env } from '../config/env';

function requiredLevelForStatus(currentStatus: string): number | null {
  if (currentStatus === 'Pending') return 1;
  if (currentStatus === 'Sent Back') return 1; // after resubmission would go to HOD again
  // We track progression via approvals count in a real system; simplified here
  return null;
}

export async function actOnApproval(req: Request, res: Response) {
  const requestId = Number(req.params.requestId);
  const { action, comments } = req.body || {};
  if (!['Approve','Reject','Send Back'].includes(action)) return res.status(400).json({ error: 'Invalid action' });
  const db = getKnex();
  const trx = await db.transaction();
  try {
    const current = await trx('requests').where({ id: requestId }).first();
    if (!current) { await trx.rollback(); return res.status(404).json({ error: 'Not found' }); }

    const user = req.user!;
    // Determine current level: count previous approvals
    const approvals = await trx('approvals').where({ request_id: requestId }).orderBy('timestamp', 'asc');
    let level = approvals.length + 1; // naive sequencing

    // Validate role per level
    const roleForLevel: Record<number, string> = { 1: 'hod', 2: 'pm', 3: 'store' };
    const expectedRole = roleForLevel[level];
    if (!expectedRole || user.role !== expectedRole) {
      await trx.rollback();
      return res.status(403).json({ error: 'Not assigned approver for this level' });
    }

    // Apply action -> update request status or route to next
    let nextStatus = current.status;
    if (action === 'Reject') nextStatus = 'Rejected';
    if (action === 'Send Back') nextStatus = 'Sent Back';
    if (action === 'Approve') {
      if (level === 1) nextStatus = 'Pending'; // move to PM queue implicitly
      if (level === 2) nextStatus = 'Pending'; // move to Store queue implicitly
      if (level === 3) nextStatus = 'Approved';
    }

    await trx('approvals').insert({ request_id: requestId, approver_id: user.id, level, action, comments, timestamp: dayjs().toDate() });
    await trx('audit_logs').insert({ request_id: requestId, action: `Approval ${action} L${level}`, performed_by: user.id, timestamp: new Date() });
    await trx('requests').where({ id: requestId }).update({ status: nextStatus });

    await trx.commit();

    // Notification emails
    if (action === 'Approve' && level === 3 && nextStatus === 'Approved') {
      // Final approval -> email KMC contact
      const setting = await db('settings').where({ key: 'kmc_contact_email' }).first();
      const to = setting?.value || env.defaults.kmcContactEmail;
      const html = emailTemplate('MR Approved', [`Request ID: ${requestId} has been approved.`]);
      sendEmail(to, `MR Approved #${requestId}`, html).catch(() => {});
    } else if (action === 'Send Back') {
      const row = await db('requests').where({ id: requestId }).first();
      if (row?.email) {
        const html = emailTemplate('MR Sent Back', ['Please edit and resubmit your material request.']);
        sendEmail(row.email, `MR Sent Back #${row.request_no}`, html).catch(() => {});
      }
    }

    const updated = await db('requests').where({ id: requestId }).first();
    res.json({ request: updated });
  } catch (err) {
    try { await trx.rollback(); } catch {}
    res.status(500).json({ error: 'Approval action failed' });
  }
}

export async function getApprovalHistory(req: Request, res: Response) {
  const requestId = Number(req.params.requestId);
  const db = getKnex();
  const rows = await db('approvals').where({ request_id: requestId }).orderBy('timestamp', 'asc');
  res.json(rows);
}
