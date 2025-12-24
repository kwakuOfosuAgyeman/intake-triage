// routes/intakes.js
import { classifyIntake } from '../services/classifier.js';
import { intakeSchema, updateIntakeSchema } from '../schemas/intake.schema.js';
import { requireAuth } from '../middleware/auth.js';

export default async function intakeRoutes(fastify, opts) {
    const { knex } = fastify;

    // POST /api/intakes - Create new intake
    fastify.post('/intakes', {
        schema: {
            body: intakeSchema
        }
    }, async (request, reply) => {
        const { name, email, description, urgency } = request.body;

        // Classify the intake
        const category = classifyIntake(description);

        // Insert into database
        const [id] = await knex('intakes').insert({
            name,
            email,
            description,
            urgency,
            category,
            status: 'new',
            created_at: new Date(),
            updated_at: new Date()
        });

        // Fetch and return created record
        const intake = await knex('intakes').where({ id }).first();

        reply.code(201).send(intake);
    });

    // GET /api/intakes - List with filters
    fastify.get('/intakes', {
        preHandler: requireAuth
    }, async (request, reply) => {
        const { status, category, sort = '-created_at' } = request.query;

        let query = knex('intakes');

        // Apply filters
        if (status) {
            query = query.where('status', status);
        }
        if (category) {
            query = query.where('category', category);
        }

        // Apply sorting
        const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
        const sortOrder = sort.startsWith('-') ? 'desc' : 'asc';
        query = query.orderBy(sortField, sortOrder);

        const intakes = await query;

        reply.send({
            data: intakes,
            total: intakes.length
        });
    });

    // GET /api/intakes/:id - Get single intake
    fastify.get('/intakes/:id', {
        preHandler: requireAuth
    }, async (request, reply) => {
        const { id } = request.params;

        const intake = await knex('intakes').where({ id }).first();

        if (!intake) {
            return reply.code(404).send({ error: 'Intake not found' });
        }

        reply.send(intake);
    });

    // PATCH /api/intakes/:id - Update intake
    fastify.patch('/intakes/:id', {
        preHandler: requireAuth,
        schema: {
            body: updateIntakeSchema
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const updates = request.body;

        // Add updated_at timestamp
        updates.updated_at = new Date();

        const rowsUpdated = await knex('intakes')
            .where({ id })
            .update(updates);

        if (rowsUpdated === 0) {
            return reply.code(404).send({ error: 'Intake not found' });
        }

        const intake = await knex('intakes').where({ id }).first();

        reply.send(intake);
    });
}