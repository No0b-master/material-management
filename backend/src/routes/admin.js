const express = require('express');
const { body } = require('express-validator');
const knex = require('../config/db');
const { authenticate, authorize } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validation');

const router = express.Router();
router.use(authenticate, authorize(['admin']));

router.get('/settings', async (req, res) => {
  const rows = await knex('settings').select('key','value');
  res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
});

router.put('/settings', [body('kmc_contact_email').isEmail()], handleValidation, async (req, res) => {
  const { kmc_contact_email } = req.body;
  const exists = await knex('settings').where({ key: 'kmc_contact_email' }).first();
  if (exists) {
    await knex('settings').where({ key: 'kmc_contact_email' }).update({ value: kmc_contact_email });
  } else {
    await knex('settings').insert({ key: 'kmc_contact_email', value: kmc_contact_email });
  }
  res.json({ kmc_contact_email });
});

module.exports = router;
