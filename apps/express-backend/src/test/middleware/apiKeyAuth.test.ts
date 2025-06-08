import { jest } from '@jest/globals';
import { Request, Response } from 'express';

import { validateApiKey } from '../../../src/middleware/apiKeyAuth';

describe('apiKeyAuth Middleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });


  it('should validate correct API key', () => {
    process.env.INTERNAL_API_KEY = 'test-api-key';
    const req = {
      headers: {
        'x-api-key': 'test-api-key'
      }
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn();
  });
  describe('validateApiKey', () => {

    it('should return 401 if no API key is provided', () => {
      const req = { headers: {} } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();
    it('Debería devolver 401 si no se proporciona una clave API', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );
  });

    validateApiKey(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject invalid API key', () => {
    const req = {
      headers: {
        'x-api-key': 'invalid-key'
      }
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn();

    validateApiKey(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error: Invalid'
    });
  });


  it('should reject missing API key', () => {
    const req = {
      headers: {}
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn();

    it('should return 401 if API key is invalid', () => {
      const req = { headers: { 'x-api-key': 'invalid-key' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

    it('Debería devolver 401 si la clave API no es válida', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      mockRequest.headers = { 'x-api-key': 'invalid-key' };
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );


    validateApiKey(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error: Invalid'
    });
  });


  it('should reject if API_KEY is not set', () => {
    process.env.INTERNAL_API_KEY = '';
    const req = {
      headers: {
        'x-api-key': 'test-key'
      }
    } as unknown as Request;
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    } as unknown as Response;
    const next = jest.fn();

    it('should call next() if API key is valid', () => {
      const req = { headers: { 'x-api-key': 'test-key' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

    it('debe llamar a next() si la clave API es válida', () => {
      const validKey = 'valid-key-123';
      process.env.INTERNAL_API_KEY = validKey;
      mockRequest.headers = { 'x-api-key': validKey };
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );


    validateApiKey(req, res, next);


    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error: Invalid'

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });


    it('should be case sensitive when comparing API keys', () => {
      const req = { headers: { 'x-api-key': 'TEST-KEY' } } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;
      const next = jest.fn();

    it('Debe distinguir entre mayúsculas y minúsculas al comparar claves API', () => {
      const validKey = 'valid-key-123';
      process.env.INTERNAL_API_KEY = validKey;
      mockRequest.headers = { 'x-api-key': 'VALID-KEY-123' };
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );


      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Debería devolver 401 si INTERNAL_API_KEY no está configurado', () => {
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

    it('debe mantener el encadenamiento de métodos (status().json())', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      
      validateApiKey(
        mockRequest as Request,
        mockResponse as unknown as Response,
        nextFunction
      );


      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });

    });
  });
});