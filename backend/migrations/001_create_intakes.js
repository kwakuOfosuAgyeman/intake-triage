// migrations/001_create_intakes.js
export const up = (knex) => {
    return knex.schema.createTable('intakes', (table) => {
    table.increments('id').primary();
    table.string('name', 100).notNull();
    table.string('email', 255).notNull();
    table.text('description').notNull();
    table.integer('urgency').notNull(); // 1-5
    table.enum('category', [
        'billing',
        'technical_support', 
        'new_matter_project',
        'other'
    ]).notNull();
    table.enum('status', [
        'new',
        'in_review',
        'resolved'
    ]).notNull().defaultTo('new');
    table.text('internal_notes');
    table.timestamp('created_at').notNull().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNull().defaultTo(knex.fn.now());
    
    table.index('status');
    table.index('category');
    table.index(['status', 'category']);
    });
};

export const down = (knex) => {
    return knex.schema.dropTable('intakes');
};