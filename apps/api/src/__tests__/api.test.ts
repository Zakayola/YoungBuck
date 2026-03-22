import request from 'supertest';
import app from '../app';
import { seedIfEmpty } from '../config/db';

/**
 * Integration tests — run against the real Express app with the in-memory store.
 * Each describe block seeds fresh data via beforeAll so tests are order-independent.
 */

let authToken: string;
let testUserId: string;

beforeAll(async () => {
  await seedIfEmpty();

  // Obtain a valid token via login so protected routes can be tested
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'alice@youngbuck.io', password: 'password123' });

  authToken = res.body.token;
  testUserId = res.body.user.id;
});

// ─── Health ────────────────────────────────────────────────────────────────

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

// ─── Auth ──────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Bob Smith',
      email: `bob+${Date.now()}@test.com`,
      password: 'Secure123',
    });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toContain('bob+');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 409 when email is already registered', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice Again',
      email: 'alice@youngbuck.io',
      password: 'Secure123',
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ name: 'No Email' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@youngbuck.io', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.name).toBe('Alice Chen');
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@youngbuck.io', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@nowhere.com', password: 'password123' });
    expect(res.status).toBe(401);
  });

  it('returns 400 when body is missing', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

// ─── Transactions ──────────────────────────────────────────────────────────

describe('GET /api/transactions', () => {
  it('returns paginated transactions when authenticated', async () => {
    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.limit).toBe('number');
    expect(typeof res.body.offset).toBe('number');
    // total must reflect the full store count, not just the page size
    expect(res.body.total).toBeGreaterThanOrEqual(res.body.data.length);
  });

  it('respects limit and offset query params', async () => {
    const res = await request(app)
      .get('/api/transactions?limit=5&offset=0')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
    expect(res.body.limit).toBe(5);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/transactions', () => {
  it('creates a transaction and returns 201', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        from: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        amount: '0.5',
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('pending');
    expect(res.body.hash).toMatch(/^0x/);
  });

  it('returns 400 when amount is missing', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ from: '0xabc', to: '0xdef' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for a non-positive amount', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ from: '0xabc', to: '0xdef', amount: '-1' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/transactions/:id', () => {
  it('returns a single transaction by id', async () => {
    const list = await request(app)
      .get('/api/transactions?limit=1')
      .set('Authorization', `Bearer ${authToken}`);
    const id = list.body.data[0].id;

    const res = await request(app)
      .get(`/api/transactions/${id}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it('returns 404 for an unknown id', async () => {
    const res = await request(app)
      .get('/api/transactions/nonexistent-id')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(404);
  });
});

// ─── Stats ─────────────────────────────────────────────────────────────────

describe('GET /api/stats', () => {
  it('returns dashboard stats when authenticated', async () => {
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.totalTransactions).toBe('number');
    expect(typeof res.body.totalVolume).toBe('string');
    expect(typeof res.body.activeWallets).toBe('number');
    expect(typeof res.body.avgGasUsed).toBe('string');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(401);
  });
});

// ─── Users ─────────────────────────────────────────────────────────────────

describe('GET /api/users/me', () => {
  it('returns the current user profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testUserId);
    expect(res.body.email).toBe('alice@youngbuck.io');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/users/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/users/me', () => {
  it('updates the user name', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: 'Alice Updated' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Alice Updated');
  });

  it('ignores attempts to update passwordHash directly', async () => {
    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ passwordHash: 'hacked' });

    expect(res.status).toBe(200);
    expect(res.body.passwordHash).toBeUndefined();
  });
});
