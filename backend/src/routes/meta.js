const express = require('express');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/dropdowns', authenticate, async (req, res) => {
  const pmList = await req.knex('users').where({ role: 'pm' }).select('id','name','email');
  const hodList = await req.knex('cost_centers').distinct('hod_name as name');
  const plants = ['PI-1','PI-2','PI-3','PI-4','SPD'];
  const purposes = ['Testing','Build','Test','Return'];
  const types = ['UPL','CO'];
  res.json({ pmList, hodList, plants, purposes, types });
});

module.exports = router;
