// backend/tests/intakes.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';


describe('Intakes API', () => {
  let app;

  beforeAll(async () => {
    vi.resetModules(); // Clears the module cache
    process.env.ADMIN_PASSWORD = 'testpassword';
    process.env.DATABASE_PATH = ':memory:';

    // Use dynamic import to ensure it reads the NEW process.env
    const { build } = await import('../src/app.js');

    app = await build({
      logger: false,
      disableRequestLogging: true
    });
  });

  afterAll(async () => {
    await app.close();
    vi.unstubAllEnvs(); // Clean up after tests
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



  describe('Authenticated Routes', () => {
    const authHeader = `Basic ${Buffer.from('admin:testpassword').toString('base64')}`;
    let createdId;

    // Seed an intake to test retrieval and updates
    beforeEach(async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/intakes',
        payload: {
          name: 'Existing Intake',
          email: 'test@example.com',
          description: 'This is a test description for authenticated routes',
          urgency: 2
        }
      });
      const body = JSON.parse(res.body);
      createdId = body.id;
    });

    describe('GET /api/intakes', () => {
      it('rejects request without authentication', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/intakes'
        });
        expect(response.statusCode).toBe(401);
      });

      it('lists intakes when authenticated', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/intakes',
          headers: { authorization: authHeader }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.total).toBeGreaterThan(0);
      });

      it('filters intakes by status', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/intakes',
          query: { status: 'new' },
          headers: { authorization: authHeader }
        });

        const body = JSON.parse(response.body);
        expect(body.data.every(i => i.status === 'new')).toBe(true);
      });
    });

    describe('GET /api/intakes/:id', () => {
      it('returns 404 for non-existent id', async () => {
        const response = await app.inject({
          method: 'GET',
          url: '/api/intakes/999',
          headers: { authorization: authHeader }
        });
        expect(response.statusCode).toBe(404);
      });

      it('returns the specific intake record', async () => {
        const response = await app.inject({
          method: 'GET',
          url: `/api/intakes/${createdId}`,
          headers: { authorization: authHeader }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.id).toBe(createdId);
        expect(body.name).toBe('Existing Intake');
      });
    });

    describe('PATCH /api/intakes/:id', () => {
      it('updates the intake status and notes', async () => {
        const response = await app.inject({
          method: 'PATCH',
          url: `/api/intakes/${createdId}`,
          headers: { authorization: authHeader },
          payload: {
            status: 'in_review',
            internal_notes: 'Checking this now'
          }
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.status).toBe('in_review');
        expect(body.internal_notes).toBe('Checking this now');
      });

      it('rejects invalid status updates', async () => {
        const response = await app.inject({
          method: 'PATCH',
          url: `/api/intakes/${createdId}`,
          headers: { authorization: authHeader },
          payload: {
            status: 'invalid_status'
          }
        });

        expect(response.statusCode).toBe(400);
      });
    });
  });
});
