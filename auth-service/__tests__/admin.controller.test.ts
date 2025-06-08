import { Request, Response } from 'express';
import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from '../src/controllers/admin.controller';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { mock, MockProxy } from 'jest-mock-extended';
import { validationResult } from 'express-validator';

// Mock dependencies
jest.mock('../src/data-source');
jest.mock('express-validator');

const mockedValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

describe('AdminController', () => {
  let mockRequest: MockProxy<Request>;
  let mockResponse: MockProxy<Response>;
  let mockUserRepository: any;

  beforeEach(() => {
    mockRequest = mock<Request>();
    mockResponse = mock<Response>();
    mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

    // Reset mocks before each test
    mockedValidationResult.mockReset();
    mockUserRepository.find.mockReset();
    mockUserRepository.findOne.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.remove.mockReset();
    mockResponse.status.mockReset();
    mockResponse.json.mockReset();

    // Default mock for response status and json
    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
    mockedValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
  });

  describe('getAllUsers', () => {
    it('should return all users successfully', async () => {
      const mockUsers = [
        { id: 'user1', username: 'user1', email: 'user1@example.com', role: 'user', createdAt: new Date() },
        { id: 'user2', username: 'user2', email: 'user2@example.com', role: 'admin', createdAt: new Date() },
      ];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      await getAllUsers(mockRequest, mockResponse);

      expect(mockUserRepository.find).toHaveBeenCalledWith({ select: ['id', 'username', 'email', 'role', 'createdAt'] });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should return 500 on internal server error', async () => {
      mockUserRepository.find.mockRejectedValue(new Error('Database error'));

      await getAllUsers(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      mockRequest.params = { userId: 'user1' };
      mockRequest.body = { role: 'admin' };
      const mockUser = { id: 'user1', username: 'user1', email: 'user1@example.com', role: 'user', createdAt: new Date() };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await updateUserRole(mockRequest, mockResponse);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user1' } });
      expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, role: 'admin' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User role updated successfully' });
    });

    it('should return 404 if user is not found', async () => {
      mockRequest.params = { userId: 'user1' };
      mockRequest.body = { role: 'admin' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await updateUserRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.params = { userId: 'user1' };
      mockRequest.body = { role: 'admin' };

      await updateUserRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.params = { userId: 'user1' };
      mockRequest.body = { role: 'admin' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await updateUserRole(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { userId: 'user1' };
      const mockUser = { id: 'user1', username: 'user1', email: 'user1@example.com', role: 'user', createdAt: new Date() };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.remove.mockResolvedValue(mockUser);

      await deleteUser(mockRequest, mockResponse);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user1' } });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
    });

    it('should return 404 if user is not found', async () => {
      mockRequest.params = { userId: 'user1' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await deleteUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.params = { userId: 'user1' };

      await deleteUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.params = { userId: 'user1' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await deleteUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
