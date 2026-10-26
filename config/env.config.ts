import * as dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
  UI_BASE_URL: process.env.UI_BASE_URL || 'http://localhost:3000',
  HEADLESS: process.env.HEADLESS !== 'false',
  DEFAULT_ADMIN: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@sandbox.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'admin123',
    name: process.env.SEED_ADMIN_NAME || 'Sandbox Admin'
  },
  DEFAULT_TIMEOUT: parseInt(process.env.DEFAULT_TIMEOUT || '15000', 10)
};
