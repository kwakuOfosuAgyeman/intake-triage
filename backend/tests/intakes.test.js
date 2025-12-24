// backend/tests/intakes.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { build } from '../src/app.js';

describe('Intakes API', () => {
  let app;

  beforeAll(async () => {
    // Set test environment
    process.env.ADMIN_PASSWORD = 'testpassword';
    process.env.DATABASE_PATH = ':memory:'; // Use in-memory database for tests
    
    app = await build({ 
      logger: false,
      disableRequestLogging: true
    });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/intakes', () => {
    it('creates intake with valid data and classifies it', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/intakes',
        payload: {
          name: 'John Doe',
          email: 'john@example.com',
          description: 'I need help with an invoice that was overcharged',
          urgency: 3
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        category: 'billing',
        status: 'new',
        urgency: 3
      });
      expect(body.id).toBeDefined();
      expect(body.created_at).toBeDefined();
    });

    it('classifies technical support requests correctly', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/intakes',
        payload: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          description: 'Cannot login, getting error 500',
          urgency: 4
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.category).toBe('technical_support');
    });

    it('rejects invalid email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/intakes',
        payload: {
          name: 'John Doe',
          email: 'not-an-email',
          description: 'Test description here that is long enough',
          urgency: 3
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation Error');
    });

    it('rejects description that is too short', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/intakes',
        payload: {
          name: 'John Doe',
          email: 'john@example.com',
          description: 'Short',
          urgency: 3
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation Error');
      expect(body.details.some(d => d.field === 'description')).toBe(true);
    });

    it('rejects invalid urgency', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/intakes',
        payload: {
          name: 'John Doe',
          email: 'john@example.com',
          description: 'Test description here',
          urgency: 10
        }
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
    