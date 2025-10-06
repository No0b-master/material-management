const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const { httpLogger } = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const env = require('./config/env');
const { authLimiter } = require('./middleware/rateLimit');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(xss());
app.use(httpLogger);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');
const openapi = fs.readFileSync(path.join(__dirname, 'docs/openapi.yaml'), 'utf-8');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, { swaggerOptions: { url: '/docs/openapi.yaml' } }));
app.get('/docs/openapi.yaml', (req, res) => {
  res.type('text/yaml').send(openapi);
});

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const requestRoutes = require('./routes/requests');
const approvalRoutes = require('./routes/approvals');
const dashboardRoutes = require('./routes/dashboards');
const reportRoutes = require('./routes/reports');
const utilRoutes = require('./routes/utils');
const adminRoutes = require('./routes/admin');
const { schedule } = require('./cron/reminders');

app.use('/auth', authLimiter, authRoutes);
app.use('/users', userRoutes);
app.use('/requests', requestRoutes);
app.use('/approvals', approvalRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/reports', reportRoutes);
app.use('/', utilRoutes);
app.use('/admin', adminRoutes);

// Error handler
app.use(errorHandler);

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`MRMS backend listening on port ${env.port}`);
  schedule();
});
