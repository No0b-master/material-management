const express = require('express');
const { body, param } = require('express-validator');
const knex = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');
const bcrypt = require('bcryptjs');

const router = express.Router();

router.use(authenticate);

router.get('/', authorize(['admin']), async (req, res) => {
  const users = await knex('users').select('id','username','name','email','contact_no','employee_code','role','department','cost_center','created_at','updated_at');
  res.json(users);
});

router.post('/', authorize(['admin']),
  [
    body('username').isString().notEmpty(),
    body('password').isString().isLength({ min: 6 }),
    body('email').isEmail(),
    body('role').isIn(['requester','hod','pm','store','admin'])
  ],
  handleValidation,
  async (req, res) => {
    const { password, ...rest } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [id] = await knex('users').insert({ ...rest, password: hashed });
    const user = await knex('users').where({ id }).first();
    res.status(201).json(user);
  }
);

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });
  const user = await knex('users').where({ id }).first();
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json(user);
});

router.put('/:id',
  [param('id').isInt(), body('email').optional().isEmail()],
  handleValidation,
  async (req, res) => {
    const id = Number(req.params.id);
    if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });
    let updates = { ...req.body };
    if (req.user.role !== 'admin') {
      // Self can only update non-privileged fields
      const allowed = ['name','email','contact_no','employee_code','password'];
      updates = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)));
    }
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    await knex('users').where({ id }).update(updates);
    const user = await knex('users').where({ id }).first();
    res.json(user);
  }
);

router.delete('/:id', authorize(['admin']), async (req, res) => {
  const id = Number(req.params.id);
  await knex('users').where({ id }).del();
  res.status(204).end();
});

module.exports = router;
