/**
 * Global error handler for Fastify
 */
export function errorHandler(error, request, reply) {
  const { log } = request;
  
  // Log the error
  log.error({
    err: error,
    request: {
      method: request.method,
      url: request.url,
      params: request.params,
      query: request.query
    }
  }, 'Request error');

  // Joi validation errors
  if (error.validation) {
    return reply.code(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    });
  }

  // Fastify validation errors
  if (error.statusCode === 400) {
    return reply.code(400).send({
      error: 'Bad Request',
      message: error.message
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

  // Default to 500 for unknown errors
  return reply.code(500).send({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'An unexpected error occurred'
  });
}