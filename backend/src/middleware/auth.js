import { config } from '../config/env.js';

/**
 * HTTP Basic Authentication middleware
 * Expects Authorization header: "Basic base64(admin:password)"
 */
export async function requireAuth(request, reply) {
  const auth = request.headers.authorization;
  
  if (!auth || !auth.startsWith('Basic ')) {
    return reply.code(401).send({ 
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }
  
  try {
    const encoded = auth.slice(6); // Remove "Basic "
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    
    if (username !== 'admin' || password !== config.adminPassword) {
      return reply.code(401).send({ 
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }
    
    // Authentication successful, continue
    request.user = { username };
  } catch (err) {
    return reply.code(401).send({ 
      error: 'Unauthorized',
      message: 'Invalid authorization header'
    });
  }
}