const express = require('express');
const knex = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/cost-centers', async (req, res) => {
  const rows = await knex('cost_centers').select('*');
  res.json(rows);
});

router.get('/meta/dropdowns', async (req, res) => {
  // Plants, Purposes, Types, PM list, HOD list from users and constants
  const plants = ['PI-1','PI-2','PI-3','PI-4','SPD'];
  const purposes = ['Testing','Build','Test','Return'];
  const types = ['UPL','CO'];
  const pms = await knex('users').where({ role: 'pm' }).select('id','name','email');
  const hods = await knex('users').where({ role: 'hod' }).select('id','name','email');
  res.json({ plants, purposes, types, pms, hods });
});

module.exports = router;
