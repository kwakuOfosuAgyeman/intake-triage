import Joi from 'joi';

/**
 * Create validation middleware for request schemas
 */
export function validateRequest(schema) {
  return async (request, reply) => {
    try {
      const validated = await schema.validateAsync(request.body, {
        abortEarly: false,
        stripUnknown: true
      });
      
      // Replace body with validated data
      request.body = validated;
    } catch (error) {
      if (error instanceof Joi.ValidationError) {
        return reply.code(400).send({
          error: 'Validation Error',
          message: 'Invalid request data',
          details: error.details.map(d => ({
            field: d.path.join('.'),
            message: d.message
          }))
        });
      }
      throw error;
    }
  };
}