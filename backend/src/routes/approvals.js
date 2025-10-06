const express = require('express');
const { body, param } = require('express-validator');
const knex = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const { sendApprovalNotification, sendFinalApprovalEmail } = require('../services/emailService');

const router = express.Router();
router.use(authenticate);

function getLevelForRole(role) {
  if (role === 'hod') return 1;
  if (role === 'pm') return 2;
  if (role === 'store') return 3;
  return null;
}

router.post('/:requestId',
  [param('requestId').isInt(), body('action').isIn(['Approve','Reject','Send Back']), body('comments').optional().isString()],
  handleValidation,
  async (req, res) => {
    const requestId = Number(req.params.requestId);
    const action = req.body.action;
    const comments = req.body.comments || null;

    const level = getLevelForRole(req.user.role);
    if (!level) return res.status(403).json({ message: 'Forbidden' });

    const trx = await knex.transaction();
    try {
      const r = await trx('requests').where({ id: requestId }).first();
      if (!r) { await trx.rollback(); return res.status(404).json({ message: 'Not found' }); }

      // Check if this level is current
      let currentLevel = 1;
      if (r.status === 'Pending' || r.status === 'Sent Back') currentLevel = 1;
      const history = await trx('approvals').where({ request_id: requestId }).orderBy('timestamp');
      const lastApprove = history.filter(h => h.action === 'Approve').length;
      currentLevel = lastApprove + 1; // move next level after each approval

      if (level !== currentLevel) { await trx.rollback(); return res.status(403).json({ message: `Not your approval level. Current level ${currentLevel}` }); }

      // Enforce assigned approver per level
      if (level === 1 && r.hod_name && req.user.name !== r.hod_name) { await trx.rollback(); return res.status(403).json({ message: 'Only assigned HOD can act' }); }
      if (level === 2 && r.pmo_name && req.user.name !== r.pmo_name) { await trx.rollback(); return res.status(403).json({ message: 'Only assigned PM can act' }); }

      const now = new Date();
      await trx('approvals').insert({ request_id: requestId, approver_id: req.user.id, level, action, comments, timestamp: now });
      await trx('audit_logs').insert({ request_id: requestId, action: `Approval ${action} L${level}`, performed_by: req.user.id, timestamp: now });

      let newStatus = r.status;
      if (action === 'Approve') {
        if (level === 1) newStatus = 'Pending';
        if (level === 2) newStatus = 'Pending';
        if (level === 3) newStatus = 'Approved';
      } else if (action === 'Reject') {
        newStatus = 'Rejected';
      } else if (action === 'Send Back') {
        newStatus = 'Sent Back';
      }

      await trx('requests').where({ id: requestId }).update({ status: newStatus, updated_at: now });

      await trx.commit();

      // Notifications post-commit
      if (action === 'Approve' && level < 3) {
        // Notify next approver
        try {
          let to = null;
          if (level === 1) {
            const pm = await knex('users').where({ role: 'pm', name: r.pmo_name }).first();
            to = pm?.email || null;
            if (to) await sendApprovalNotification(2, to, r.request_no);
          } else if (level === 2) {
            const stores = await knex('users').where({ role: 'store' }).select('email');
            const emails = stores.map(s => s.email).filter(Boolean);
            if (emails.length) await sendApprovalNotification(3, emails.join(','), r.request_no);
          }
        } catch { /* ignore */ }
      }
      if (action === 'Approve' && level === 3) {
        await sendFinalApprovalEmail(r.request_no);
      }
      if (action === 'Send Back') {
        // Send email to owner
        try {
          const to = r.email;
          if (to) {
            await require('../services/emailService').sendEmail({
              to,
              subject: `MRMS: Request ${r.request_no} sent back` ,
              html: `<p>Your request <b>${r.request_no}</b> was sent back with comments: ${comments || ''}</p>`
            });
          }
        } catch { /* ignore */ }
      }

      res.json({ message: 'Action recorded', status: newStatus });
    } catch (e) {
      await trx.rollback();
      res.status(500).json({ message: e.message });
    }
  }
);

router.get('/:requestId', [param('requestId').isInt()], handleValidation, async (req, res) => {
  const requestId = Number(req.params.requestId);
  const r = await knex('requests').where({ id: requestId }).first();
  if (!r) return res.status(404).json({ message: 'Not found' });
  const isOwner = req.user.id === r.created_by;
  const isAssignedHod = req.user.role === 'hod' && r.hod_name === req.user.name;
  const isAssignedPm = req.user.role === 'pm' && r.pmo_name === req.user.name;
  const isStore = req.user.role === 'store';
  if (!(req.user.role === 'admin' || isOwner || isAssignedHod || isAssignedPm || isStore)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const approvals = await knex('approvals')
    .where({ request_id: requestId })
    .leftJoin('users', 'approvals.approver_id', 'users.id')
    .select('approvals.*', 'users.name as approver_name', 'users.role as approver_role')
    .orderBy('timestamp', 'asc');
  res.json(approvals);
});

module.exports = router;
