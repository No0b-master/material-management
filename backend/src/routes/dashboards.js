const express = require('express');
const knex = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/user/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.role !== 'admin' && req.user.id !== id) return res.status(403).json({ message: 'Forbidden' });
  const rows = await knex('requests').where({ created_by: id }).orderBy('request_date', 'desc');
  res.json(rows);
});

router.get('/approver/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!['hod','pm','store','admin'].includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  // Pending items awaiting this approver's action based on current level logic
  const history = await knex('approvals').select('request_id').count({ c: '*' }).groupBy('request_id');
  const countsByRequestId = Object.fromEntries(history.map(h => [h.request_id, Number(h.c)]));
  let allPending = await knex('requests').whereIn('status', ['Pending','Sent Back']);
  const levelForRole = req.user.role === 'hod' ? 1 : req.user.role === 'pm' ? 2 : 3;
  // assigned approver filter
  if (req.user.role === 'hod') allPending = allPending.filter(r => r.hod_name === req.user.name);
  if (req.user.role === 'pm') allPending = allPending.filter(r => r.pmo_name === req.user.name);
  const queue = allPending.filter(r => (countsByRequestId[r.id] || 0) + 1 === levelForRole);
  res.json(queue);
});

module.exports = router;
