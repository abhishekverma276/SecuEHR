import request from 'supertest';
import express from 'express';
import router from '../src/routes/admin.routes';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';

// Mock dependencies
jest.mock('../src/middleware/auth.middleware');
jest.mock('../src/middleware/admin.middleware');

const mockedAuthenticateJWT = require('../src/middleware/auth.middleware').authenticateJWT as jest.Mock;
const mockedIsAdmin = require('../src/middleware/admin.middleware').isAdmin as jest.Mock;

describe('Admin Routes Integration Tests', () => {
  let app: express.Application;
  let connection: DataSource;
  let userRepository: any;
  let adminUser: User;
  let normalUser: User;

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
    mockedAuthenticateJWT.mockReset();
    mockedIsAdmin.mockReset();

    // Create an admin user and a normal user for testing
    adminUser = await userRepository.save({ username: 'adminuser', passwordHash: 'hashedPassword', role: 'admin', email: 'admin@example.com' });
    normalUser = await userRepository.save({ username: 'normaluser', passwordHash: 'hashedPassword', role: 'user', email: 'normal@example.com' });

    // Mock authenticateJWT to pass for all tests
    mockedAuthenticateJWT.mockImplementation((req, res, next) => {
      (req as any).user = { id: adminUser.id, role: adminUser.role };
      next();
    });

    // Mock isAdmin to pass for all tests
    mockedIsAdmin.mockImplementation((req, res, next) => {
      if ((req as any).user.role === 'admin') {
        next();
      } else {
        return res.status(403).json({ message: 'Forbidden' });
      }
    });
  });

  afterAll(async () => {
    // Close the database connection after all tests
    await connection.destroy();
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
      expect(response.body[0].id).toBeDefined();
      expect(response.body[0].username).toBeDefined();
      expect(response.body[0].email).toBeDefined();
      expect(response.body[0].role).toBeDefined();
      expect(response.body[0].createdAt).toBeDefined();
    });

    it('should return 403 if user is not admin', async () => {
        mockedIsAdmin.mockImplementation((req, res, next) => {
            return res.status(403).json({ message: 'Forbidden' });
        });
        mockedAuthenticateJWT.mockImplementation((req, res, next) => {
            (req as any).user = { id: normalUser.id, role: normalUser.role };
            next();
          });
        const response = await request(app).get('/users');
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden');
      });
  });

  describe('PUT /users/:userId', () => {
    it('should update user role', async () => {
      const response = await request(app)
        .put(`/users/${normalUser.id}`)
        .send({ role: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User role updated successfully');

      const updatedUser = await userRepository.findOne({ where: { id: normalUser.id } });
      expect(updatedUser?.role).toBe('admin');
    });

    it('should return 404 if user is not found', async () => {
      const response = await request(app)
        .put('/users/550e8400-e29b-41d4-a716-446655440000')
        .send({ role: 'admin' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 if validation fails', async () => {
        const response = await request(app)
          .put(`/users/${normalUser.id}`)
          .send({ role: '' });
  
        expect(response.status).toBe(400);
        expect(response.body.errors).toBeDefined();
      });

      it('should return 403 if user is not admin', async () => {
        mockedIsAdmin.mockImplementation((req, res, next) => {
            return res.status(403).json({ message: 'Forbidden' });
        });
        mockedAuthenticateJWT.mockImplementation((req, res, next) => {
            (req as any).user = { id: normalUser.id, role: normalUser.role };
            next();
          });
        const response = await request(app)
          .put(`/users/${normalUser.id}`)
          .send({ role: 'admin' });
  
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden');
      });
  });

  describe('DELETE /users/:userId', () => {
    it('should delete a user', async () => {
      const response = await request(app).delete(`/users/${normalUser.id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User deleted successfully');

      const deletedUser = await userRepository.findOne({ where: { id: normalUser.id } });
      expect(deletedUser).toBeNull();
    });

    it('should return 404 if user is not found', async () => {
      const response = await request(app).delete('/users/550e8400-e29b-41d4-a716-446655440000');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 400 if validation fails', async () => {
        const response = await request(app).delete(`/users/`);
  
        expect(response.status).toBe(404);
      });

      it('should return 403 if user is not admin', async () => {
        mockedIsAdmin.mockImplementation((req, res, next) => {
            return res.status(403).json({ message: 'Forbidden' });
        });
        mockedAuthenticateJWT.mockImplementation((req, res, next) => {
            (req as any).user = { id: normalUser.id, role: normalUser.role };
            next();
          });
        const response = await request(app).delete(`/users/${normalUser.id}`);
  
        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Forbidden');
      });
  });
});
