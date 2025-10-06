const knex = require('knex');
const { db } = require('./env');

const isTest = process.env.NODE_ENV === 'test';

const knexConfig = isTest
  ? {
      client: 'sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
      pool: { min: 1, max: 1, afterCreate: (conn, done) => conn.run('PRAGMA foreign_keys = ON', done) },
      migrations: {
        tableName: 'knex_migrations',
        directory: __dirname + '/../db/migrations',
      },
      seeds: {
        directory: __dirname + '/../db/seeds',
      },
    }
  : {
      client: 'mysql2',
      connection: {
        host: db.host,
        user: db.user,
        password: db.password,
        database: db.database,
        multipleStatements: true,
      },
      pool: { min: 2, max: 10 },
      migrations: {
        tableName: 'knex_migrations',
        directory: __dirname + '/../db/migrations',
      },
      seeds: {
        directory: __dirname + '/../db/seeds',
      },
    };

const knexInstance = knex(knexConfig);

module.exports = { knex: knexInstance, knexConfig };
