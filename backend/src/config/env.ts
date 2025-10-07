import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASS || 'secret',
    name: process.env.DB_NAME || 'mrms',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_me_refresh',
    accessTtlSec: 60 * 30, // 30 minutes
    refreshTtlSec: 60 * 60 * 24 * 7, // 7 days
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'mrms@example.com',
  },
  defaults: {
    kmcContactEmail: process.env.KMC_CONTACT_EMAIL || 'kmc@example.com',
  }
};
