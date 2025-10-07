import knex, { Knex } from 'knex';
import { env } from '../config/env';

let knexInstance: Knex | null = null;

export function getKnex(): Knex {
  if (!knexInstance) {
    knexInstance = knex({
      client: 'mysql2',
      connection: {
        host: env.db.host,
        user: env.db.user,
        password: env.db.pass,
        database: env.db.name,
        multipleStatements: true,
      },
      pool: { min: 0, max: 10 },
    });
  }
  return knexInstance;
}
