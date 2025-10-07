import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xssClean from 'xss-clean';
import { httpLogger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import { swaggerSpec as openapiSpec } from './controllers/openapi';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import requestRoutes from './routes/requests';
import approvalRoutes from './routes/approvals';
import dashboardRoutes from './routes/dashboard';
import reportRoutes from './routes/reports';
import metaRoutes from './routes/meta';
import auditRoutes from './routes/audit';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
// @ts-expect-error types missing for xss-clean
app.use(xssClean());
app.use(httpLogger);

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });

// Swagger setup (placeholder, will add definitions later)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/audit', auditRoutes);
app.get('/api/health', (_req, res) => res.json({ status: 'ok', env: env.nodeEnv }));

app.use(errorHandler);

export default app;
