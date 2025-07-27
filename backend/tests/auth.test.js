const request = require('supertest');
const app = require('../server');
const User = require('../models/user');
const mongoose = require('mongoose');

describe('Auth System', () => {
  // Test user data
  const testUser = {
    name: 'Test User',
    email: 'test@aibanking.com',
    password: 'securePassword123'
  };

  // Clear database before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Close DB connection after all tests
  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('User Registration', () => {
    it('should register a new user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('email', testUser.email);
      expect(res.body.data).toHaveProperty('name', testUser.name);
      expect(res.body.data).not.toHaveProperty('password'); // Password shouldn't be returned
    });

    it('should reject registration with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: '123' });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toMatch(/password/i); // Case-insensitive check for password error
    });

    it('should reject registration with missing fields', async () => {
      const tests = [
        { ...testUser, name: undefined },
        { ...testUser, email: undefined },
        { ...testUser, password: undefined }
      ];

      for (const payload of tests) {
        const res = await request(app)
          .post('/api/auth/register')
          .send(payload);
        
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('error');
      }
    });

    it('should reject duplicate email registration', async () => {
      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(testUser);

      // Attempt to register same email again
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email already exists');
    });
  });

  describe('User Login', () => {
    beforeEach(async () => {
      // Register a test user before login tests
      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('email', testUser.email);
    });

    it('should reject login with incorrect password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongPassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@aibanking.com',
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });
});