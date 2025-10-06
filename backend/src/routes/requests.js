const express = require('express');
const Joi = require('joi');
const { authenticate, authorize } = require('../middleware/auth');
const { generateRequestNo } = require('../utils/requestNo');
const { audit } = require('../utils/logger');

const router = express.Router();

const requestSchema = Joi.object({
  dept: Joi.string().required(),
  cost_center: Joi.string().required(),
  hod_name: Joi.string().required(),
  n3_code: Joi.string().required(),
  username: Joi.string().required(),
  contact_no: Joi.string().required(),
  employee_code: Joi.string().required(),
  email: Joi.string().email().required(),
  pmo_name: Joi.string().required(),
  part_code: Joi.string().required(),
  description: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  type: Joi.string().valid('UPL','CO').required(),
  project_name: Joi.string().allow(''),
  purpose: Joi.string().valid('Testing','Build','Test','Return').required(),
  plant_name: Joi.string().valid('PI-1','PI-2','PI-3','PI-4','SPD').required(),
  plant_on_hand_qty: Joi.number().integer().min(0).allow(null),
});

router.post('/', authenticate, authorize(['requester','admin']), async (req, res) => {
  const { error, value } = requestSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const trx = await req.knex.transaction();
  try {
    const requestNo = await generateRequestNo(trx);
    const [id] = await trx('requests').insert({
      ...value,
      request_no: requestNo,
      request_date: trx.fn.now(),
      status: 'Pending',
      created_by: req.user.id,
    });
    await audit(trx, id, 'Request Created', req.user.id);
    await trx.commit();
    const created = await req.knex('requests').where({ id }).first();
    res.status(201).json(created);
  } catch (e) {
    await trx.rollback();
    res.status(500).json({ message: 'Failed to create request' });
  }
});

router.get('/', authenticate, async (req, res) => {
  const { from, to, department, status, approver } = req.query;
  const q = req.knex('requests').select('*');
  if (from) q.where('request_date', '>=', from);
  if (to) q.where('request_date', '<=', to);
  if (department) q.where('dept', department);
  if (status) q.where('status', status);

  const role = req.user.role;
  if (role === 'admin') {
    // all
  } else if (['hod','pm','store'].includes(role)) {
    if (role === 'hod') q.where('status', 'Pending');
    if (role === 'pm') q.where('status', 'HOD Approved');
    if (role === 'store') q.where('status', 'PM Approved');
  } else {
    q.where('created_by', req.user.id);
  }

  const rows = await q.orderBy('request_date', 'desc');
  res.json(rows);
});

router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const request = await req.knex('requests').where({ id }).first();
  if (!request) return res.status(404).json({ message: 'Not found' });
  const role = req.user.role;
  const isOwner = Number(request.created_by) === Number(req.user.id);
  if (!(role === 'admin' || isOwner || ['hod','pm','store'].includes(role))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  res.json(request);
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const request = await req.knex('requests').where({ id }).first();
  if (!request) return res.status(404).json({ message: 'Not found' });
  const isOwner = Number(request.created_by) === Number(req.user.id);
  if (!(isOwner || req.user.role === 'admin')) return res.status(403).json({ message: 'Forbidden' });
  if (request.status !== 'Sent Back') return res.status(400).json({ message: 'Only editable when Sent Back' });
  await req.knex('requests').where({ id }).update({ ...req.body, updated_at: req.knex.fn.now() });
  res.json(await req.knex('requests').where({ id }).first());
});

router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const request = await req.knex('requests').where({ id }).first();
  if (!request) return res.status(404).json({ message: 'Not found' });
  const isOwner = Number(request.created_by) === Number(req.user.id);
  if (!(isOwner || req.user.role === 'admin')) return res.status(403).json({ message: 'Forbidden' });
  if (request.status !== 'Pending') return res.status(400).json({ message: 'Only cancel before approval starts' });
  await req.knex('requests').where({ id }).del();
  res.status(204).send();
});

module.exports = router;
