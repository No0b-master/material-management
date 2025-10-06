const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { httpLogger } = require('./utils/logger');
const { knex } = require('./config/db');
const { nodeEnv } = require('./config/env');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const approvalRoutes = require('./routes/approvals');
const dashboardRoutes = require('./routes/dashboards');
const reportRoutes = require('./routes/reports');
const metaRoutes = require('./routes/meta');
const costCenterRoutes = require('./routes/costCenters');
const docsRoutes = require('./routes/docs');

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(httpLogger);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/auth', authLimiter);

app.use((req, res, next) => { req.knex = knex; next(); });

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/requests', requestRoutes);
app.use('/approvals', approvalRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reports', reportRoutes);
app.use('/meta', metaRoutes);
app.use('/cost-centers', costCenterRoutes);
app.use('/docs', docsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', env: nodeEnv }));

app.use((err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
