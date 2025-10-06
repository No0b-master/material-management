const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/user/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (!(req.user.role === 'admin' || Number(req.user.id) === Number(id))) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const rows = await req.knex('requests').where({ created_by: id }).orderBy('request_date', 'desc');
  res.json(rows);
});

router.get('/approver/:id', authenticate, async (req, res) => {
  const role = req.user.role;
  if (!['hod','pm','store','admin'].includes(role)) return res.status(403).json({ message: 'Forbidden' });
  const q = req.knex('requests');
  if (role === 'hod') q.where('status', 'Pending');
  if (role === 'pm') q.where('status', 'HOD Approved');
  if (role === 'store' || role === 'admin') q.where('status', 'PM Approved');
  const rows = await q.orderBy('request_date', 'asc');
  res.json(rows);
});

module.exports = router;
