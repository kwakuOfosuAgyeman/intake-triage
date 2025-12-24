// src/services/intakeService.js
import { classifyIntake } from './classifier.js';
import { sanitizeObject } from '../utils/sanitize.js';

/**
 * Business logic for intake operations
 */
export class IntakeService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new intake - handles sanitization and classification
   */
  create(rawData) {
    // 1. Sanitize input strings to prevent XSS
    const cleanData = sanitizeObject(rawData);
    
    // 2. Automatically classify based on description
    const category = classifyIntake(cleanData.description);
    
    const now = new Date().toISOString();
    
    return this.db.insert('intakes', {
      ...cleanData,
      category,
      status: 'new',
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Find intakes with optional filters
   */
  findMany(filters = {}) {
    const { status, category, sort = '-created_at' } = filters;

    // Handle sorting logic
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
    const sortDirection = sort.startsWith('-') ? 'DESC' : 'ASC';

    const options = {
      orderBy: { field: sortField, direction: sortDirection }
    };

    // Build where clause from filters
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    if (Object.keys(where).length > 0) {
      options.where = where;
    }

    const intakes = this.db.findMany('intakes', options);

    return {
      data: intakes,
      total: intakes.length
    };
  }

  /**
   * Find intake by ID
   */
  findById(id) {
    return this.db.findOne('intakes', { id });
  }

  /**
   * Update intake - handles sanitization and timestamping
   */
  update(id, rawUpdates) {
    // 1. Sanitize incoming updates
    const cleanUpdates = sanitizeObject(rawUpdates);
    cleanUpdates.updated_at = new Date().toISOString();

    const rowsChanged = this.db.update('intakes', { id }, cleanUpdates);
    
    if (rowsChanged === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Get system statistics
   */
  getStats() {
    const db = this.db.raw;
    
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count FROM intakes GROUP BY status
    `).all();

    const categoryCounts = db.prepare(`
      SELECT category, COUNT(*) as count FROM intakes GROUP BY category
    `).all();

    return {
      byStatus: statusCounts.reduce((acc, { status, count }) => {
        acc[status] = count;
        return acc;
      }, {}),
      byCategory: categoryCounts.reduce((acc, { category, count }) => {
        acc[category] = count;
        return acc;
      }, {}),
      total: db.prepare('SELECT COUNT(*) as count FROM intakes').get().count
    };
  }
}