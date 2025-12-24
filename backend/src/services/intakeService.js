/**
 * Business logic for intake operations
 */
export class IntakeService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Create a new intake
   */
  create(data) {
    const now = new Date().toISOString();
    
    return this.db.insert('intakes', {
      ...data,
      status: 'new',
      created_at: now,
      updated_at: now
    });
  }

  /**
   * Find intakes with optional filters
   */
  findMany(filters = {}) {
    const options = {
      orderBy: { field: 'created_at', direction: 'DESC' }
    };

    // Build where clause from filters
    const where = {};
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.category) {
      where.category = filters.category;
    }

    if (Object.keys(where).length > 0) {
      options.where = where;
    }

    return this.db.findMany('intakes', options);
  }

  /**
   * Find intake by ID
   */
  findById(id) {
    return this.db.findOne('intakes', { id });
  }

  /**
   * Update intake
   */
  update(id, data) {
    const updates = {
      ...data,
      updated_at: new Date().toISOString()
    };

    const rowsChanged = this.db.update('intakes', { id }, updates);
    
    if (rowsChanged === 0) {
      return null;
    }

    return this.findById(id);
  }

  /**
   * Get statistics
   */
  getStats() {
    const db = this.db.raw;
    
    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM intakes
      GROUP BY status
    `).all();

    const categoryCounts = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM intakes
      GROUP BY category
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