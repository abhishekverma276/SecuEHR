import request from 'supertest';
import express from 'express';
import router from '../src/routes/auth.routes';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Routes Integration Tests', () => {
  let app: express.Application;
  let connection: DataSource;
  let userRepository: any;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use(router);

    // Initialize a test database connection
    connection = await AppDataSource.initialize();
    userRepository = connection.getRepository(User);
  });

  beforeEach(async () => {
    // Clear the database before each test
    await userRepository.clear();
    (mockedBcrypt.hash as jest.Mock).mockReset();
    (mockedBcrypt.compare as jest.Mock).mockReset();
    mockedJwt.sign.mockReset();
    mockedJwt.verify.mockReset();
  });

  afterAll(async () => {
    // Close the database connection after all tests
    await connection.destroy();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const response = await request(app)
        .post('/register')
        .send({ username: 'testuser', password: 'password', email: 'test@example.com' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.userId).toBeDefined();

      const user = await userRepository.findOne({ where: { username: 'testuser' } });
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
      expect(user?.passwordHash).toBe('hashedPassword');
    });

    it('should return 400 if user already exists', async () => {
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      await userRepository.save({ username: 'existinguser', passwordHash: 'hashedPassword', role: 'user', email: 'test@example.com' });

      const response = await request(app)
        .post('/register')
        .send({ username: 'existinguser', password: 'password', email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/register')
        .send({ username: '', password: '', email: '' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /login', () => {
    it('should login a user successfully without TOTP', async () => {
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      const user = await userRepository.save({ username: 'testuser', passwordHash: 'hashedPassword', role: 'user', email: 'test@example.com' });
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedJwt.sign as jest.Mock).mockReturnValue('mockedToken');

      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.token).toBe('mockedToken');
    });

    it('should return 401 if user does not exist', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: 'nonexistentuser', password: 'password' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 if password is invalid', async () => {
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      await userRepository.save({ username: 'testuser', passwordHash: 'hashedPassword', role: 'user', email: 'test@example.com' });
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .post('/login')
        .send({ username: 'testuser', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: '', password: '' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /password-request', () => {
    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/password-request')
        .send({ email: '' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /reset-password', () => {
    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/reset-password')
        .send({ token: '', email: '', newPassword: '' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });
  });
});
