import { getKnex } from '../db/knex';

async function run() {
  const knex = getKnex();
  try {
    await knex.migrate.latest({ directory: 'src/db/migrations' });
    // eslint-disable-next-line no-console
    console.log('Migrations completed');
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Migration failed', err);
    process.exit(1);
  }
}

run();
