/**
 * Global error handler for Fastify
 */
export function errorHandler(error, request, reply) {
  const { log } = request;

  // Log the error for internal tracking
  log.error({
    err: error,
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query
    }
  }, 'Request error');

  // AJV / Fastify validation errors
  if (error.validation) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: 'The request data is invalid',
      // Map AJV errors to a cleaner format for the frontend/tests
      details: error.validation.map(err => ({
        field: err.instancePath.replace('/', '') || err.params.missingProperty,
        message: err.message,
        keyword: err.keyword
      }))
    });
  }

  // Authentication errors
  if (error.statusCode === 401) {
    return reply.code(401).send({
      error: 'Unauthorized',
      message: error.message || 'Authentication required'
    });
  }

  // Not found errors
  if (error.statusCode === 404) {
    return reply.code(404).send({
      error: 'Not Found',
      message: error.message
    });
  }

  // Rate limit errors
  if (error.statusCode === 429) {
    return reply.code(429).send({
      error: 'Too Many Requests',
      message: error.message
    });
  }

  // Default to 500 for unknown errors
  const isDev = process.env.NODE_ENV === 'development';
  return reply.code(500).send({
    error: 'Internal Server Error',
    message: isDev ? error.message : 'An unexpected error occurred'
  });
}