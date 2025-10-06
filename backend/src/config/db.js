const knexConfig = require('../../knexfile');
const env = require('./env');
const knex = require('knex')(knexConfig[env.nodeEnv]);

module.exports = knex;
