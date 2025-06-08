import { Request, Response } from 'express';
import {
  requestPasswordReset,
  resetPassword,
} from '../src/controllers/password.controller';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { mock, MockProxy } from 'jest-mock-extended';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { sendEmail } from '../src/utility/email.service';

// Mock dependencies
jest.mock('../src/data-source');
jest.mock('express-validator');
jest.mock('bcrypt');
jest.mock('crypto');
jest.mock('../src/utility/email.service');

const mockedValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedCrypto = crypto as jest.Mocked<typeof crypto>;
const mockedSendEmail = sendEmail as jest.MockedFunction<typeof sendEmail>;

describe('PasswordController', () => {
  let mockRequest: MockProxy<Request>;
  let mockResponse: MockProxy<Response>;
  let mockUserRepository: any;

  beforeEach(() => {
    mockRequest = mock<Request>();
    mockResponse = mock<Response>();
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    Object.defineProperty(mockRequest, 'protocol', { value: 'http' });
    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

    // Reset mocks before each test
    mockedValidationResult.mockReset();
    mockUserRepository.findOne.mockReset();
    mockUserRepository.save.mockReset();
    mockedBcrypt.hash.mockReset();
    mockedBcrypt.compare.mockReset();
    mockedCrypto.randomBytes.mockReset();
    mockedSendEmail.mockReset();
    mockResponse.status.mockReset();
    mockResponse.json.mockReset();

    // Default mock for response status and json
    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
    mockedValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
  });

  describe('requestPasswordReset', () => {
    it('should send password reset link successfully', async () => {
      mockRequest.body = { email: 'test@example.com' };
    //   mockRequest.protocol = 'http';
      mockRequest.get.mockReturnValue('localhost:3000');
      const mockUser = { id: 'user1', email: 'test@example.com', resetToken: null, resetTokenExpiry: null };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockedCrypto.randomBytes.mockReturnValue({ toString: () => 'resetToken' } as any);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedResetToken');
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockedSendEmail.mockResolvedValue(undefined);

      await requestPasswordReset(mockRequest, mockResponse);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockedCrypto.randomBytes).toHaveBeenCalledWith(32);
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('resetToken', 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        resetToken: 'hashedResetToken',
        resetTokenExpiry: expect.any(Date),
      }));
      expect(mockedSendEmail).toHaveBeenCalledWith('test@example.com', 'Password Reset Request', expect.stringContaining('http://localhost:3000/reset-password/?token=resetToken&email=test@example.com'));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Password reset link sent to your email' });
    });

    it('should return 404 if user is not found', async () => {
      mockRequest.body = { email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await requestPasswordReset(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.body = { email: 'test@example.com' };

      await requestPasswordReset(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.body = { email: 'test@example.com' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await requestPasswordReset(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockRequest.body = { token: 'resetToken', email: 'test@example.com', newPassword: 'newPassword' };
      const mockUser = { id: 'user1', email: 'test@example.com', resetToken: 'hashedResetToken', resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), passwordHash: 'oldHashedPassword' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      mockUserRepository.save.mockResolvedValue(mockUser);

      await resetPassword(mockRequest, mockResponse);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('resetToken', 'hashedResetToken');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        passwordHash: 'newHashedPassword',
        resetToken: undefined,
        resetTokenExpiry: undefined,
      }));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Password reset successfully' });
    });

    it('should return 400 if token is invalid', async () => {
      mockRequest.body = { token: 'invalidToken', email: 'test@example.com', newPassword: 'newPassword' };
      const mockUser = { id: 'user1', email: 'test@example.com', resetToken: 'hashedResetToken', resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000) };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await resetPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid token' });
    });

    it('should return 400 if token is expired', async () => {
      mockRequest.body = { token: 'resetToken', email: 'test@example.com', newPassword: 'newPassword' };
      const mockUser = { id: 'user1', email: 'test@example.com', resetToken: 'hashedResetToken', resetTokenExpiry: new Date(Date.now() - 60 * 60 * 1000) };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await resetPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    });

    it('should return 400 if user is not found', async () => {
      mockRequest.body = { token: 'resetToken', email: 'test@example.com', newPassword: 'newPassword' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await resetPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.body = { token: 'resetToken', email: 'test@example.com', newPassword: 'newPassword' };

      await resetPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.body = { token: 'resetToken', email: 'test@example.com', newPassword: 'newPassword' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await resetPassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
