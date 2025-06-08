import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateJWT, authorizeRoles, AuthRequest } from '../src/middleware/auth.middleware';
import { isAdmin } from '../src/middleware/admin.middleware';
import { mock, MockProxy } from 'jest-mock-extended';

// Mock dependencies
jest.mock('jsonwebtoken');

const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
  let mockRequest: MockProxy<AuthRequest>;
  let mockResponse: MockProxy<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = mock<AuthRequest>();
    mockResponse = mock<Response>();
    mockNext = jest.fn();

    // Reset mocks before each test
    (mockedJwt.verify as jest.Mock).mockReset();
    mockResponse.sendStatus.mockReset();
    mockResponse.status.mockReset();
    mockResponse.json.mockReset();
    mockNext.mockReset();

    // Default mock for response status and json
    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
  });

  describe('authenticateJWT', () => {
    it('should call next if token is valid', () => {
      mockRequest.headers = { authorization: 'Bearer validToken' };
      (mockedJwt.verify as jest.Mock).mockReturnValue({ userId: 'userId', role: 'user' });

      authenticateJWT(mockRequest, mockResponse, mockNext);

      expect(mockedJwt.verify).toHaveBeenCalledWith('validToken', 'your_jwt_secret');
      expect(mockRequest.user).toEqual({ userId: 'userId', role: 'user' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 403 if token is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalidToken' };
      mockedJwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });

      authenticateJWT(mockRequest, mockResponse, mockNext);

      expect(mockedJwt.verify).toHaveBeenCalledWith('invalidToken', 'your_jwt_secret');
      expect(mockResponse.sendStatus).toHaveBeenCalledWith(403);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 if no token is provided', () => {
      mockRequest.headers = {};

      authenticateJWT(mockRequest, mockResponse, mockNext);

      expect(mockResponse.sendStatus).toHaveBeenCalledWith(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    const authorizeUser = authorizeRoles(['user']);
    const authorizeAdmin = authorizeRoles(['admin']);

    it('should call next if user has required role', () => {
      mockRequest.user = { userId: 'userId', role: 'user' };

      authorizeUser(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required role', () => {
      mockRequest.user = { userId: 'userId', role: 'user' };

      authorizeAdmin(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden: insufficient permissions' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 403 if user is not defined', () => {
        mockRequest.user = undefined;
  
        authorizeAdmin(mockRequest, mockResponse, mockNext);
  
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Forbidden: insufficient permissions' });
        expect(mockNext).not.toHaveBeenCalled();
      });
  });
});




describe('isAdmin Middleware', () => {
  let mockRequest: MockProxy<Request>;
  let mockResponse: MockProxy<Response>;
  let mockNext: jest.Mock<NextFunction>;

  beforeEach(() => {
    mockRequest = mock<Request>();
    mockResponse = mock<Response>();
    mockNext = jest.fn();

    // Reset mocks before each test
    mockResponse.status.mockReset();
    mockResponse.json.mockReset();
    mockNext.mockReset();

    // Default mock for response status and json
    mockResponse.status.mockReturnThis();
    mockResponse.json.mockReturnThis();
  });

  it('should call next if user is admin', () => {
    (mockRequest as any).user = { role: 'admin' };

    isAdmin(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should call next if user is superadmin', () => {
    (mockRequest as any).user = { role: 'superadmin' };

    isAdmin(mockRequest, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not admin or superadmin', () => {
    (mockRequest as any).user = { role: 'user' };

    isAdmin(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Access denied. Admin only.' });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 403 if user is not defined', () => {
    (mockRequest as any).user = undefined;

    isAdmin(mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Access denied. Admin only.' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
