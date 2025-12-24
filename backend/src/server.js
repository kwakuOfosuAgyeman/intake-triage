import { build } from './app.js';
import { config } from './config/env.js';

/**
 * Start the server
 */
async function start() {
  const app = await build();

  try {
    await app.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });
    
    app.log.info(`Server listening on http://localhost:${config.port}`);
    app.log.info(`Environment: ${config.nodeEnv}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();