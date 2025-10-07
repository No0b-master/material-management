import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('settings').del();
  await knex('settings').insert([
    { key: 'kmc_contact_email', value: 'kmc@example.com' },
  ]);
}
