import Fastify from 'fastify';
import cors from '@fastify/cors';
import { initDatabase, createDbWrapper } from './config/db.js';
import { IntakeService } from './services/intakeService.js';
import { errorHandler } from './middleware/errorHandler.js';
import intakeRoutes from './routes/intakes.js';
import { config } from './config/env.js';

/**
 * Build and configure Fastify application
 */
export async function build(opts = {}) {
  const app = Fastify({
    logger: opts.logger !== false ? {
      level: config.logLevel,
      transport: config.nodeEnv === 'development' ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      } : undefined
    } : false,
    disableRequestLogging: opts.disableRequestLogging || false
  });

  // Register CORS
  await app.register(cors, {
    origin: config.nodeEnv === 'development' 
      ? ['http://localhost:5173', 'http://localhost:3000']
      : true, // Configure for production
    credentials: true
  });

  // Initialize database
  const db = initDatabase();
  const dbWrapper = createDbWrapper(db);
  
  // Initialize services
  const intakeService = new IntakeService(dbWrapper);

  // Decorate fastify instance with services
  app.decorate('db', dbWrapper);
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