// src/routes/intakes.js
import { intakeSchema, updateIntakeSchema } from '../schemas/intake.schema.js';
import { requireAuth } from '../middleware/auth.js';

export default async function intakeRoutes(fastify, opts) {
  // Use the service decorated in app.js
  const { intakeService } = fastify;

  /**
   * POST /api/intakes - Create new intake
   */
  fastify.post('/intakes', {
    schema: { body: intakeSchema }
  }, async (request, reply) => {
    const intake = intakeService.create(request.body);
    return reply.code(201).send(intake);
  });

  /**
   * GET /api/intakes - List with filters (Protected)
   */
  fastify.get('/intakes', {
    preHandler: requireAuth
  }, async (request, reply) => {
    // findMany now returns { data, total }
    return intakeService.findMany(request.query);
  });

  /**
   * GET /api/intakes/stats - Dashboard statistics (Protected)
   */
  fastify.get('/intakes/stats', {
    preHandler: requireAuth
  }, async (request, reply) => {
    return intakeService.getStats();
  });

  /**
   * GET /api/intakes/:id - Get single intake (Protected)
   */
  fastify.get('/intakes/:id', {
    preHandler: requireAuth
  }, async (request, reply) => {
    const intake = intakeService.findById(request.params.id);
    if (!intake) return reply.code(404).send({ error: 'Intake not found' });
    return intake;
  });

  /**
   * PATCH /api/intakes/:id - Update intake (Protected)
   */
  fastify.patch('/intakes/:id', {
    preHandler: requireAuth,
    schema: { body: updateIntakeSchema }
  }, async (request, reply) => {
    const intake = intakeService.update(request.params.id, request.body);
    
    if (!intake) {
      return reply.code(404).send({ error: 'Intake not found' });
    }
    
    return intake;
  });
}