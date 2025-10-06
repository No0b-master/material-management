require('dotenv').config();

const base = {
  client: 'mysql2',
  pool: { min: 2, max: 10 },
  migrations: { directory: './migrations', tableName: 'knex_migrations' },
  seeds: { directory: './seeds' }
};

module.exports = {
  development: {
    ...base,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      multipleStatements: true
    }
  },
  test: {
    client: 'sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
    migrations: { directory: './migrations', tableName: 'knex_migrations' },
    seeds: { directory: './seeds' }
  },
  production: {
    ...base,
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      multipleStatements: true
    }
  }
};
