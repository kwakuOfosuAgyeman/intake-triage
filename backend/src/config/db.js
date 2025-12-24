import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { config } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Initialize SQLite database connection
 */
export function initDatabase() {
  // Ensure data directory exists
  const dbDir = dirname(config.databasePath);
  if (!existsSync(dbDir)) {
    mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(config.databasePath);
  
  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');
  
  // Run migrations if needed
  runMigrations(db);
  
  return db;
}

/**
 * Run database migrations
 */
function runMigrations(db) {
  // Create migrations table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Check if intakes table exists
  const tableExists = db.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name='intakes'
  `).get();

  if (!tableExists) {
    console.log('Running initial migration...');
    
    db.exec(`
      CREATE TABLE intakes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        description TEXT NOT NULL,
        urgency INTEGER NOT NULL CHECK(urgency BETWEEN 1 AND 5),
        category TEXT NOT NULL CHECK(category IN ('billing', 'technical_support', 'new_matter_project', 'other')),
        status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'in_review', 'resolved')),
        internal_notes TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_intakes_status ON intakes(status);
      CREATE INDEX idx_intakes_category ON intakes(category);
      CREATE INDEX idx_intakes_status_category ON intakes(status, category);
      CREATE INDEX idx_intakes_created_at ON intakes(created_at DESC);
    `);

    db.prepare(`
      INSERT INTO migrations (name) VALUES (?)
    `).run('001_create_intakes');

    console.log('Migration completed successfully');
  }
}

/**
 * Create a simple query wrapper for better ergonomics
 */
export function createDbWrapper(db) {
  return {
    // Insert a record and return the inserted row
    insert(table, data) {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      
      const stmt = db.prepare(`
        INSERT INTO ${table} (${keys.join(', ')})
        VALUES (${placeholders})
      `);
      
      const info = stmt.run(...values);
      
      // Return the inserted row
      return db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(info.lastInsertRowid);
    },

    // Find one record
    findOne(table, where) {
      const keys = Object.keys(where);
      const values = Object.values(where);
      const conditions = keys.map(k => `${k} = ?`).join(' AND ');
      
      return db.prepare(`
        SELECT * FROM ${table} WHERE ${conditions}
      `).get(...values);
    },

    // Find many records
    findMany(table, options = {}) {
      let query = `SELECT * FROM ${table}`;
      const params = [];

      // WHERE clause
      if (options.where) {
        const keys = Object.keys(options.where);
        const values = Object.values(options.where);
        const conditions = keys.map(k => `${k} = ?`).join(' AND ');
        query += ` WHERE ${conditions}`;
        params.push(...values);
      }

      // ORDER BY clause
      if (options.orderBy) {
        const { field, direction = 'ASC' } = options.orderBy;
        query += ` ORDER BY ${field} ${direction}`;
      }

      // LIMIT clause
      if (options.limit) {
        query += ` LIMIT ?`;
        params.push(options.limit);
      }

      return db.prepare(query).all(...params);
    },

    // Update records
    update(table, where, data) {
      const setKeys = Object.keys(data);
      const setValues = Object.values(data);
      const whereKeys = Object.keys(where);
      const whereValues = Object.values(where);

      const setClause = setKeys.map(k => `${k} = ?`).join(', ');
      const whereClause = whereKeys.map(k => `${k} = ?`).join(' AND ');

      const stmt = db.prepare(`
        UPDATE ${table}
        SET ${setClause}
        WHERE ${whereClause}
      `);

      const info = stmt.run(...setValues, ...whereValues);
      return info.changes;
    },

    // Raw query access
    raw: db
  };
}