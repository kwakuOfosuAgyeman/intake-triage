// schemas/intake.schema.js
export const intakeSchema = {
    type: 'object',
    required: ['name', 'email', 'description', 'urgency'],
    properties: {
        name: { type: 'string', minLength: 1, maxLength: 100 },
        email: { type: 'string', format: 'email' },
        description: { type: 'string', minLength: 10, maxLength: 5000 },
        urgency: { type: 'integer', minimum: 1, maximum: 5 }
    }
};

export const updateIntakeSchema = {
    type: 'object',
    minProperties: 1,
    properties: {
        status: { type: 'string', enum: ['new', 'in_review', 'resolved'] },
        internal_notes: { type: 'string', maxLength: 5000 }
    }
};