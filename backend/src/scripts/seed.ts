import { getKnex } from '../db/knex';

async function run() {
  const knex = getKnex();
  try {
    await knex.seed.run({ directory: 'src/db/seeds' });
    // eslint-disable-next-line no-console
    console.log('Seeds completed');
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Seed failed', err);
    process.exit(1);
  }
}

run();
