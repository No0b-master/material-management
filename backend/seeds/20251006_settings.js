/** @param {import('knex').Knex} knex */
exports.seed = async function seed(knex) {
  await knex('settings').del();
  await knex('settings').insert({ key: 'kmc_contact_email', value: 'kmc@example.com' });
};
