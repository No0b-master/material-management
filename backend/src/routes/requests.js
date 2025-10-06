const express = require('express');
const { body, param, query } = require('express-validator');
const knex = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const { generateRequestNo } = require('../utils/requestNo');

const router = express.Router();
router.use(authenticate);

router.post('/', authorize(['requester','admin']),
  [
    body('dept').notEmpty(),
    body('cost_center').notEmpty(),
    body('hod_name').notEmpty(),
    body('username').notEmpty(),
    body('contact_no').notEmpty(),
    body('employee_code').notEmpty(),
    body('email').isEmail(),
    body('pmo_name').notEmpty(),
    body('part_code').notEmpty(),
    body('description').notEmpty(),
    body('quantity').isInt({ gt: 0 }),
    body('type').isIn(['UPL','CO']),
    body('purpose').isIn(['Testing','Build','Test','Return']),
    body('plant_name').isIn(['PI-1','PI-2','PI-3','PI-4','SPD'])
  ],
  handleValidation,
  async (req, res) => {
    const trx = await knex.transaction();
    try {
      const requestNo = await generateRequestNo(trx);
      const now = new Date();
      const [id] = await trx('requests').insert({
        request_no: requestNo,
        request_date: now,
        status: 'Pending',
        created_by: req.user.id,
        ...req.body
      });
      await trx('audit_logs').insert({ request_id: id, action: 'Request Created', performed_by: req.user.id, timestamp: now });
      await trx.commit();
      const data = await knex('requests').where({ id }).first();
      // Notify HOD level 1
      try {
        const hod = await knex('users').where({ role: 'hod', name: data.hod_name }).first();
        if (hod?.email) {
          const { sendApprovalNotification } = require('../services/emailService');
          await sendApprovalNotification(1, hod.email, data.request_no);
        }
      } catch { /* ignore email failures */ }
      res.status(201).json(data);
    } catch (e) {
      await trx.rollback();
      res.status(500).json({ message: e.message });
    }
  }
);

router.get('/', async (req, res) => {
  const { startDate, endDate, department, status, approver } = req.query;
  let q = knex('requests');
  if (req.user.role === 'admin') {
    // all
  } else if (['hod','pm','store'].includes(req.user.role)) {
    // show relevant to their queue by status/level
    // Simplified: show Pending for everyone; detailed query in approvals queue endpoint
  } else {
    q = q.where('created_by', req.user.id);
  }
  if (startDate) q = q.where('request_date', '>=', new Date(startDate));
  if (endDate) q = q.where('request_date', '<=', new Date(endDate));
  if (department) q = q.where('dept', department);
  if (status) q = q.where('status', status);
  // approver filter would require join; omitted for brevity here
  const rows = await q.orderBy('request_date', 'desc');
  res.json(rows);
});

router.get('/:id', [param('id').isInt()], handleValidation, async (req, res) => {
  const id = Number(req.params.id);
  const r = await knex('requests').where({ id }).first();
  if (!r) return res.status(404).json({ message: 'Not found' });
  if (req.user.role !== 'admin' && req.user.id !== r.created_by && !['hod','pm','store'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(r);
});

router.put('/:id', [param('id').isInt()], handleValidation, async (req, res) => {
  const id = Number(req.params.id);
  const r = await knex('requests').where({ id }).first();
  if (!r) return res.status(404).json({ message: 'Not found' });
  if (req.user.role !== 'admin' && req.user.id !== r.created_by) return res.status(403).json({ message: 'Forbidden' });
  if (r.status !== 'Sent Back') return res.status(400).json({ message: 'Only editable when Sent Back' });
  await knex('requests').where({ id }).update({ ...req.body, updated_at: new Date() });
  await knex('audit_logs').insert({ request_id: id, action: 'Request Updated', performed_by: req.user.id, timestamp: new Date() });
  const updated = await knex('requests').where({ id }).first();
  res.json(updated);
});

router.delete('/:id', [param('id').isInt()], handleValidation, async (req, res) => {
  const id = Number(req.params.id);
  const r = await knex('requests').where({ id }).first();
  if (!r) return res.status(404).json({ message: 'Not found' });
  if (req.user.role !== 'admin' && req.user.id !== r.created_by) return res.status(403).json({ message: 'Forbidden' });
  // Allowed only before approval starts: meaning no approvals exist
  const approvals = await knex('approvals').where({ request_id: id });
  if (approvals.length > 0) return res.status(400).json({ message: 'Cannot cancel after approvals started' });
  await knex('requests').where({ id }).del();
  await knex('audit_logs').insert({ request_id: id, action: 'Request Cancelled', performed_by: req.user.id, timestamp: new Date() });
  res.status(204).end();
});

module.exports = router;
