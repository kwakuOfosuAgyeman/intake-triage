import 'dotenv/config';

/**
 * Validate and export environment variables
 */
function validateEnv() {
  const required = ['ADMIN_PASSWORD'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    adminPassword: process.env.ADMIN_PASSWORD,
    databasePath: process.env.DATABASE_PATH || './data/intakes.db',
    logLevel: process.env.LOG_LEVEL || 'info'
  };
}

export const config = validateEnv();