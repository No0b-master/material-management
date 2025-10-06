const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  const rows = await req.knex('cost_centers').select('*');
  res.json(rows);
});

module.exports = router;
