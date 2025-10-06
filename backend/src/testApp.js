const path = require('path');
process.env.NODE_ENV = 'test';
require('dotenv').config({ path: path.resolve(__dirname, '../.env.test') });
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const { httpLogger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const { authLimiter } = require('./middleware/rateLimit');
const knex = require('./config/db');

module.exports = async function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(xss());
  app.use(httpLogger);

  const authRoutes = require('./routes/auth');
  const usersRoutes = require('./routes/users');
  const requestRoutes = require('./routes/requests');
  const approvalRoutes = require('./routes/approvals');
  app.use('/auth', authLimiter, authRoutes);
  app.use('/users', usersRoutes);
  app.use('/requests', requestRoutes);
  app.use('/approvals', approvalRoutes);
  app.use(errorHandler);
  // ensure DB ready
  await knex.migrate.latest();
  await knex.seed.run();
  return app;
};
