import type { Knex } from 'knex';
import { env } from '../config/env';

const common: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: env.db.host,
    user: env.db.user,
    password: env.db.pass,
    database: env.db.name,
    multipleStatements: true,
  },
  pool: { min: 0, max: 10 },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
    extension: 'ts',
  },
  seeds: {
    directory: './seeds',
    extension: 'ts',
  },
};

module.exports = {
  development: common,
  production: common,
};
