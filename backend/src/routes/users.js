const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { authenticate, authorize } = require('../middleware/auth');
const { canAccessUser } = require('../middleware/rbac');

const router = express.Router();

const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  contact_no: Joi.string().allow(''),
  employee_code: Joi.string().allow(''),
  role: Joi.string().valid('requester','hod','pm','store','admin').required(),
  department: Joi.string().allow(''),
  cost_center: Joi.string().allow(''),
});

router.get('/', authenticate, authorize(['admin']), async (req, res) => {
  const users = await req.knex('users').select('*');
  res.json(users);
});

router.post('/', authenticate, authorize(['admin']), async (req, res) => {
  const { error, value } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  const hashed = await bcrypt.hash(value.password, 10);
  const [id] = await req.knex('users').insert({ ...value, password: hashed });
  const user = await req.knex('users').where({ id }).first();
  res.status(201).json(user);
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (!canAccessUser(req, id)) return res.status(403).json({ message: 'Forbidden' });
  const updates = { ...req.body };
  if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);
  await req.knex('users').where({ id }).update(updates);
  const user = await req.knex('users').where({ id }).first();
  res.json(user);
});

router.delete('/:id', authenticate, authorize(['admin']), async (req, res) => {
  const { id } = req.params;
  await req.knex('users').where({ id }).del();
  res.status(204).send();
});

router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (!canAccessUser(req, id)) return res.status(403).json({ message: 'Forbidden' });
  const user = await req.knex('users').where({ id }).first();
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

module.exports = router;
