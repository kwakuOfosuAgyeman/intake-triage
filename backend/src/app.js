import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initDatabase, createDbWrapper } from './config/db.js';
import { IntakeService } from './services/intakeService.js';
import { errorHandler } from './middleware/errorHandler.js';
import intakeRoutes from './routes/intakes.js';
import { config } from './config/env.js';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Build and configure Fastify application
 */
export async function build(opts = {}) {

  const loggerConfig = {
    level: config.logLevel || 'info',
    transport: {
      targets: [
        // 1. Console logging (Pretty printing in dev, JSON in prod)
        {
          target: config.nodeEnv === 'development' ? 'pino-pretty' : 'pino/record',
          options: config.nodeEnv === 'development' ? {
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname'
          } : {},
          level: config.logLevel
        },
        // 2. Daily Rotating File Logging
        {
          target: 'pino-roll',
          options: {
            file: path.join(__dirname, '../logs/app-log'),
            frequency: 'daily',
            size: '10m', // Also rotate if file exceeds 10MB
            mkdir: true,
            extension: '.log',
            limit: {
              count: 30 // Keep the last 30 files
            }
          },
          level: 'info'
        }
      ]
    }
  };
  const app = Fastify({
    logger: opts.logger !== false ? loggerConfig : false,
    disableRequestLogging: opts.disableRequestLogging || false
  });

  // Register CORS
  await app.register(cors, {
    origin: config.nodeEnv === 'development'
      ? ['http://localhost:5173', 'http://localhost:8000']
      : true, // Configure for production
    credentials: true,
  });

  await app.register(helmet, {
    contentSecurityPolicy: config.nodeEnv === 'production'
  });

  await app.register(rateLimit, {
    max: 100, // Limit each IP to 100 requests per window
    timeWindow: '1 minute', // The duration of the window
    errorResponseBuilder: (request, context) => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `I'm sorry, you've sent too many requests. Please wait ${context.after} and try again.`
      };
    }
  });

  // Initialize database
  const db = initDatabase();
  const dbWrapper = createDbWrapper(db);

  // Initialize services
  const intakeService = new IntakeService(dbWrapper);

  // Decorate fastify instance with services
  app.decorate('knex', dbWrapper);
  app.decorate('intakeService', intakeService);

  // Register error handler
  app.setErrorHandler(errorHandler);

  // Register routes
  await app.register(intakeRoutes, { prefix: '/api' });

  // Graceful shutdown
  const closeGracefully = async (signal) => {
    app.log.info(`Received ${signal}, closing server gracefully`);
    await app.close();
    db.close();
    process.exit(0);
  };

  process.on('SIGINT', () => closeGracefully('SIGINT'));
  process.on('SIGTERM', () => closeGracefully('SIGTERM'));

  return app;
}