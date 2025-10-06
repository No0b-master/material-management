const express = require('express');
const Joi = require('joi');
const { authenticate } = require('../middleware/auth');
const { audit } = require('../utils/logger');

const router = express.Router();

const actionSchema = Joi.object({ action: Joi.string().valid('Approve','Reject','Send Back').required(), comments: Joi.string().allow('') });

function nextStatus(level, action) {
  if (action === 'Reject') return 'Rejected';
  if (action === 'Send Back') return 'Sent Back';
  if (action === 'Approve') {
    if (level === 1) return 'HOD Approved';
    if (level === 2) return 'PM Approved';
    if (level === 3) return 'Approved';
  }
  return 'Pending';
}

router.post('/:requestId', authenticate, async (req, res) => {
  const { error, value } = actionSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const { requestId } = req.params;
  const request = await req.knex('requests').where({ id: requestId }).first();
  if (!request) return res.status(404).json({ message: 'Not found' });

  const role = req.user.role;
  let level = null;
  if (role === 'hod') level = 1; else if (role === 'pm') level = 2; else if (role === 'store') level = 3; else if (role === 'admin') level = 3; // admin can finalize
  if (!level) return res.status(403).json({ message: 'Forbidden' });

  // Basic gate: ensure correct stage
  if (level === 1 && request.status !== 'Pending') return res.status(400).json({ message: 'Not at HOD stage' });
  if (level === 2 && request.status !== 'HOD Approved') return res.status(400).json({ message: 'Not at PM stage' });
  if (level === 3 && request.status !== 'PM Approved') return res.status(400).json({ message: 'Not at Store stage' });

  const trx = await req.knex.transaction();
  try {
    const status = nextStatus(level, value.action);
    await trx('approvals').insert({ request_id: requestId, approver_id: req.user.id, level, action: value.action, comments: value.comments || '', timestamp: trx.fn.now() });
    await trx('requests').where({ id: requestId }).update({ status, updated_at: trx.fn.now() });
    await audit(trx, requestId, `Approval: ${value.action}`, req.user.id);
    await trx.commit();
    res.json(await req.knex('requests').where({ id: requestId }).first());
  } catch (e) {
    await trx.rollback();
    res.status(500).json({ message: 'Failed to record approval' });
  }
});

router.get('/:requestId', authenticate, async (req, res) => {
  const { requestId } = req.params;
  const rows = await req.knex('approvals').where({ request_id: requestId }).orderBy('timestamp', 'asc');
  res.json(rows);
});

module.exports = router;
