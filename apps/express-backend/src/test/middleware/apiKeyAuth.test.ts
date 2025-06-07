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
      status: jest.fn().mockImplementation(function (this: any) {
        return this;
      }),
      json: jest.fn().mockImplementation(function (this: any, body: any) {
        return this;
      })
    };

    nextFunction = jest.fn();
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.INTERNAL_API_KEY = 'test-key';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('validateApiKey', () => {
    it('should return 401 if no API key is provided', () => {
      const req = { headers: {} } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if API key is invalid', () => {
      const req = { headers: { 'x-api-key': 'invalid-key' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() if API key is valid', () => {
      const req = { headers: { 'x-api-key': 'test-key' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should be case sensitive when comparing API keys', () => {
      const req = { headers: { 'x-api-key': 'TEST-KEY' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if INTERNAL_API_KEY is not set', () => {
      delete process.env.INTERNAL_API_KEY;
      const req = { headers: { 'x-api-key': 'test-key' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should maintain method chaining (status().json())', () => {
      const req = { headers: {} } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
    });
  });
});