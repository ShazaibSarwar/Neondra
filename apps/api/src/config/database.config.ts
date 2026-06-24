import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433', 10),
  username: process.env.DB_USERNAME || 'wfgts',
  password: process.env.DB_PASSWORD || 'wfgts_dev',
  name: process.env.DB_NAME || 'wfgts',
  synchronize: process.env.DB_SYNC === 'true' || process.env.NODE_ENV !== 'production',
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true',
}));