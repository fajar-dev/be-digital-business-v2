import { createPool } from 'mysql2/promise';
import { config } from './app';

export const nisPool = createPool({
  ...config.db.nis,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export const dashboardPool = createPool({
  ...config.db.dashboard,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
