import { jest } from '@jest/globals';
import type { Request, Response, NextFunction } from 'express';
import { validateApiKey } from '../../middleware/apiKeyAuth.js';

describe('apiKeyAuth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: {
    status: jest.Mock<any>;
    json: jest.Mock<any>;
  };
  let nextFunction: jest.Mock;
  const originalEnv = process.env;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    
    // Implementación correctamente tipada para los mocks
    mockResponse = {
      status: jest.fn().mockImplementation(function(this: any) {
        return this;
      }),
      json: jest.fn().mockImplementation(function(this: any, body: any) {
        return this;
      })
    };
    
    nextFunction = jest.fn();
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateApiKey', () => {
    it('should return 401 if no API key is provided', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error: Invalid'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if API key is invalid', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      mockRequest.headers = { 'x-api-key': 'invalid-key' };
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Error: Invalid'
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if API key is valid', () => {
      const validKey = 'valid-key-123';
      process.env.INTERNAL_API_KEY = validKey;
      mockRequest.headers = { 'x-api-key': validKey };
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should be case sensitive when comparing API keys', () => {
      const validKey = 'valid-key-123';
      process.env.INTERNAL_API_KEY = validKey;
      mockRequest.headers = { 'x-api-key': 'VALID-KEY-123' };
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if INTERNAL_API_KEY is not set', () => {
      delete process.env.INTERNAL_API_KEY;
      mockRequest.headers = { 'x-api-key': 'any-key' };
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should maintain method chaining (status().json())', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );

      // Verificar que el mock permite chaining
      expect(mockResponse.status(401)).toBe(mockResponse);
      expect(mockResponse.json({ error: 'test' })).toBe(mockResponse);
    });
  });
});