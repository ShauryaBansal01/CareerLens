const request = require('supertest');
const express = require('express');

beforeAll(() => {
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.SMTP_EMAIL = 'test@careerlens.test';
  process.env.SMTP_PASSWORD = 'test-password';
});

jest.mock('../models/User', () => {
  const makeUser = (email) => ({
    _id: '507f191e810c19729de860ea',
    name: email === 'test@example.com' ? 'Test User' : 'Existing User',
    email,
    password: 'hashedpassword',
    role: 'user',
    defaultAIProvider: 'gemini',
    isActive: true,
    matchPassword: jest.fn().mockResolvedValue(true),
  });

  const known = { 'test@example.com': makeUser('test@example.com'), 'existing@example.com': makeUser('existing@example.com') };

  const buildQuery = (user) => {
    const p = Promise.resolve(user);
    p.select = jest.fn().mockResolvedValue(user);
    return p;
  };

  return {
    findOne: jest.fn().mockImplementation((query) => buildQuery(known[query?.email] || null)),
    create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: '507f191e810c19729de860ea', name: data.name, email: data.email, role: 'user' })),
    findById: jest.fn().mockResolvedValue(makeUser('test@example.com')),
  };
});

jest.mock('../models/OTP', () => {
  const VALID_CODE = '123456';

  return {
    // The controller talks to the model through these two statics; they own
    // hashing, the attempt limit, and single-use consumption.
    issue: jest.fn().mockResolvedValue(VALID_CODE),
    verifyAndConsume: jest.fn().mockImplementation(
      async (email, code) => code === VALID_CODE
    ),
    findOne: jest.fn().mockImplementation(() => {
      const q = Promise.resolve(null);
      q.sort = jest.fn().mockResolvedValue(null);
      return q;
    }),
    create: jest.fn().mockResolvedValue({}),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
  };
});

jest.mock('../models/RefreshToken', () => {
  const mockRefreshToken = {
    _id: 'refresh-id-123',
    user: '507f191e810c19729de860ea',
    tokenHash: 'mocked-hash',
    family: 'mocked-family',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    revoked: false,
    save: jest.fn().mockResolvedValue(true),
  };

  return {
    findOne: jest.fn().mockResolvedValue(mockRefreshToken),
    create: jest.fn().mockResolvedValue(mockRefreshToken),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    hashToken: jest.fn().mockReturnValue('mocked-hash'),
    generateFamily: jest.fn().mockReturnValue('mocked-family'),
    generateToken: jest.fn().mockReturnValue('mocked-refresh-token'),
  };
});

jest.mock('bcrypt', () => ({
  compare: jest.fn().mockResolvedValue(true),
  hash: jest.fn().mockResolvedValue('hashedpassword'),
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
  verify: jest.fn().mockReturnValue({ id: '507f191e810c19729de860ea' }),
}));

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mock-id' }),
  }),
}));

const authRoutes = require('../routes/authRoutes');

function createApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
}

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('registers a new user with valid OTP', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New User', email: 'new@example.com', password: 'password123', otp: '123456' });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it('rejects registration with short password', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New User', email: 'new@example.com', password: '123', otp: '123456' });

      expect(res.status).toBe(400);
    });

    it('rejects registration with invalid email', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New User', email: 'notanemail', password: 'password123', otp: '123456' });

      expect(res.status).toBe(400);
    });

    it('rejects registration without OTP', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'New User', email: 'new@example.com', password: 'password123' });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('accepts valid credentials', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('rejects missing password', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(res.status).toBe(400);
    });

    it('rejects non-existent email', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/send-otp', () => {
    it('sends OTP for a new email', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: 'new@example.com' });

      expect(res.status).toBe(200);
    });

    // Must not reveal whether an account exists: an existing address gets the
    // same status and body as a new one, and simply has no OTP issued.
    it('does not disclose that an email is already registered', async () => {
      const app = createApp();
      const OTP = require('../models/OTP');

      const newEmail = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: 'new@example.com' });
      const existingEmail = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: 'existing@example.com' });

      expect(existingEmail.status).toBe(newEmail.status);
      expect(existingEmail.body).toEqual(newEmail.body);
      // ...and no code was actually minted for the existing account.
      expect(OTP.issue).toHaveBeenCalledTimes(1);
      expect(OTP.issue).toHaveBeenCalledWith('new@example.com');
    });

    it('rejects invalid email format', async () => {
      const app = createApp();
      const res = await request(app)
        .post('/api/auth/send-otp')
        .send({ email: 'invalid' });

      expect(res.status).toBe(400);
    });
  });
});
