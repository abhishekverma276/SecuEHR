import { Request, Response } from 'express';

import { User } from '../src/entity/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { validationResult } from 'express-validator';
import {
  registerUser,
  loginUser,
  setupTOTP,
  verifyOTPForTOTP,
  changePassword,
} from '../src/controllers/auth.controller';
import { mock, MockProxy } from 'jest-mock-extended';
import { AppDataSource } from '../src/data-source';

// Mock dependencies
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('speakeasy');
jest.mock('qrcode');
jest.mock('express-validator');
jest.mock('../src/data-source');

process.env.JWT_SECRET = 'supersecret123';

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;
const mockedSpeakeasy = speakeasy as jest.Mocked<typeof speakeasy>;
const mockedQRCode = QRCode as jest.Mocked<typeof QRCode>;
const mockedValidationResult = validationResult as jest.MockedFunction<typeof validationResult>;

describe('AuthController', () => {
  let mockRequest: MockProxy<Request>;
  let mockResponse: MockProxy<Response>;
  let mockUserRepository: any;


  beforeAll(() => {
    process.env.JWT_SECRET = "supersecret123";

    jest.spyOn(jwt, "sign").mockImplementation(() => "mocked-jwt-token");
  });

  afterAll(() => {
    jest.restoreAllMocks();
  }); 
  

  beforeEach(() => {
    mockRequest = mock<Request>();
    mockResponse = mock<Response>();
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockUserRepository);

    // Reset mocks before each test
    (mockedBcrypt.hash as jest.Mock).mockReset();
    (mockedBcrypt.compare as jest.Mock).mockReset();
    (mockedJwt.sign as jest.Mock).mockReset();
    mockedSpeakeasy.generateSecret.mockReset();
    (mockedSpeakeasy.totp.verify as jest.Mock).mockReset();
    mockedQRCode.toDataURL.mockReset();
    mockedValidationResult.mockReset();
    mockUserRepository.create.mockReset();
    mockUserRepository.save.mockReset();
    mockUserRepository.findOne.mockReset();
    mockResponse.status.mockReset();
    mockResponse.json.mockReset();

    // Default mock for response status and json
    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
    mockedValidationResult.mockReturnValue({ isEmpty: () => true, array: () => [] } as any);
    
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      mockRequest.body = { username: 'testuser', password: 'password', email: 'test@example.com' };
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.findOne.mockResolvedValue(null);
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', email: 'test@example.com' };
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      await registerUser(mockRequest, mockResponse);

      expect(mockedBcrypt.hash).toHaveBeenCalledWith('password', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        username: 'testuser',
        passwordHash: 'hashedPassword',
        role: 'user',
        email: 'test@example.com',
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        userId: 'userId',
      });
    });

    it('should return 400 if user already exists', async () => {
      mockRequest.body = { username: 'existinguser', password: 'password', email: 'test@example.com' };
      mockUserRepository.findOne.mockResolvedValue({ username: 'existinguser' });

      await registerUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User already exists' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.body = { username: 'testuser', password: 'password', email: 'test@example.com' };

      await registerUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.body = { username: 'testuser', password: 'password', email: 'test@example.com' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await registerUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('loginUser', () => {
    it('should login a user successfully without TOTP', async () => {
      mockRequest.body = { username: 'testuser', password: 'password' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: null };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedJwt.sign as jest.Mock).mockReturnValue('mockedToken');

      await loginUser(mockRequest, mockResponse);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(mockedJwt.sign).toHaveBeenCalledWith({ userId: 'userId', role: 'user' }, 'supersecret123', { expiresIn: '1h' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Login successful', token: 'mockedToken' });
    });

    it('should login a user successfully with TOTP', async () => {
      mockRequest.body = { username: 'testuser', password: 'password', otp: '123456' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: 'secret' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedSpeakeasy.totp.verify as jest.Mock).mockReturnValue(true);
      (mockedJwt.sign as jest.Mock).mockReturnValue('mockedToken');

      await loginUser(mockRequest, mockResponse);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password', 'hashedPassword');
      expect(mockedSpeakeasy.totp.verify).toHaveBeenCalledWith({ secret: 'secret', encoding: 'base32', token: '123456', window: 1 });
      expect(mockedJwt.sign).toHaveBeenCalledWith({ userId: 'userId', role: 'user' }, 'supersecret123', { expiresIn: '1h' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Login successful', token: 'mockedToken' });
    });

    it('should return 401 if OTP is required but not provided', async () => {
      mockRequest.body = { username: 'testuser', password: 'password' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: 'secret' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);

      await loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'OTP is required' });
    });

    it('should return 401 if OTP is invalid', async () => {
      mockRequest.body = { username: 'testuser', password: 'password', otp: '123456' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: 'secret' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedSpeakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      await loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid OTP' });
    });

    it('should return 401 if user does not exist', async () => {
      mockRequest.body = { username: 'nonexistentuser', password: 'password' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 401 if password is invalid', async () => {
      mockRequest.body = { username: 'testuser', password: 'wrongpassword' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: null };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid credentials' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.body = { username: 'testuser', password: 'password' };

      await loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.body = { username: 'testuser', password: 'password' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await loginUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('setupTOTP', () => {
    it('should setup TOTP successfully', async () => {
      mockRequest.params = { userId: 'userId' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: null };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const mockSecret = { base32: 'base32secret', otpauth_url: 'otpauth://...' };
      mockedSpeakeasy.generateSecret.mockReturnValue(mockSecret as any);
      (mockedQRCode.toDataURL as jest.Mock).mockResolvedValue('qrCodeUrl');

      await setupTOTP(mockRequest, mockResponse);

      expect(mockedSpeakeasy.generateSecret).toHaveBeenCalledWith({ length: 20 });
      expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, totpSecret: 'base32secret' });
      expect(mockedQRCode.toDataURL).toHaveBeenCalledWith('otpauth://...');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ secret: 'base32secret', qrCode: 'qrCodeUrl' });
    });

    it('should return 404 if user is not found', async () => {
      mockRequest.params = { userId: 'userId' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await setupTOTP(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.params = { userId: 'userId' };

      await setupTOTP(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.params = { userId: 'userId' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await setupTOTP(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('verifyOTPForTOTP', () => {
    it('should verify OTP successfully', async () => {
      mockRequest.params = { userId: 'userId' };
      mockRequest.body = { token: '123456' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: 'secret' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedSpeakeasy.totp.verify as jest.Mock).mockReturnValue(true);

      await verifyOTPForTOTP(mockRequest, mockResponse);

      expect(mockedSpeakeasy.totp.verify).toHaveBeenCalledWith({ secret: 'secret', encoding: 'base32', token: '123456', window: 1 });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'OTP verified successfully' });
    });

    it('should return 404 if TOTP is not set up', async () => {
      mockRequest.params = { userId: 'userId' };
      mockRequest.body = { token: '123456' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: null };
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await verifyOTPForTOTP(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'TOTP is not set up' });
    });

    it('should return 401 if OTP is invalid', async () => {
      mockRequest.params = { userId: 'userId' };
      mockRequest.body = { token: '123456' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'hashedPassword', role: 'user', totpSecret: 'secret' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedSpeakeasy.totp.verify as jest.Mock).mockReturnValue(false);

      await verifyOTPForTOTP(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid OTP' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.params = { userId: 'userId' };
      mockRequest.body = { token: '123456' };

      await verifyOTPForTOTP(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.params = { userId: 'userId' };
      mockRequest.body = { token: '123456' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await verifyOTPForTOTP(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      mockRequest.body = { oldPassword: 'oldPassword', newPassword: 'newPassword' };
      (mockRequest as any).user = { id: 'userId' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'oldHashedPassword', role: 'user', totpSecret: null };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
      (mockedBcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      await changePassword(mockRequest, mockResponse);

      expect(mockedBcrypt.compare).toHaveBeenCalledWith('oldPassword', 'oldHashedPassword');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword', 10);
      expect(mockUserRepository.save).toHaveBeenCalledWith({ ...mockUser, passwordHash: 'newHashedPassword' });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Password changed successfully' });
    });

    it('should return 404 if user is not found', async () => {
      mockRequest.body = { oldPassword: 'oldPassword', newPassword: 'newPassword' };
      (mockRequest as any).user = { id: 'userId' };
      mockUserRepository.findOne.mockResolvedValue(null);

      await changePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 401 if old password is invalid', async () => {
      mockRequest.body = { oldPassword: 'wrongOldPassword', newPassword: 'newPassword' };
      (mockRequest as any).user = { id: 'userId' };
      const mockUser = { id: 'userId', username: 'testuser', passwordHash: 'oldHashedPassword', role: 'user', totpSecret: null };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      (mockedBcrypt.compare as jest.Mock).mockResolvedValue(false);

      await changePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid password' });
    });

    it('should return 400 if validation fails', async () => {
      mockedValidationResult.mockReturnValue({ isEmpty: () => false, array: () => ['error'] } as any);
      mockRequest.body = { oldPassword: 'oldPassword', newPassword: 'newPassword' };
      (mockRequest as any).user = { id: 'userId' };

      await changePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ errors: ['error'] });
    });

    it('should return 500 on internal server error', async () => {
      mockRequest.body = { oldPassword: 'oldPassword', newPassword: 'newPassword' };
      (mockRequest as any).user = { id: 'userId' };
      mockUserRepository.findOne.mockRejectedValue(new Error('Database error'));

      await changePassword(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Internal server error' });
    });
  });
});
