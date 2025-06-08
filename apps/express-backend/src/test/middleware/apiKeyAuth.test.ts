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

  // Función helper para crear mock Request
  const createMockRequest = (headers: Record<string, string> = {}): Request => {
    return {
      headers,
      get: jest.fn(),
      header: jest.fn(),
      accepts: jest.fn(),
      acceptsCharsets: jest.fn(),
      acceptsEncodings: jest.fn(),
      acceptsLanguages: jest.fn(),
      range: jest.fn(),
      param: jest.fn(),
      is: jest.fn(),
      app: {} as any,
      baseUrl: '',
      body: {},
      cookies: {},
      fresh: false,
      hostname: '',
      ip: '',
      ips: [],
      method: '',
      originalUrl: '',
      params: {},
      path: '',
      protocol: '',
      query: {},
      route: {} as any,
      secure: false,
      signedCookies: {},
      stale: false,
      subdomains: [],
      xhr: false,
      ...{} as any
    } as unknown as Request;
  };

  // Función helper para crear mock Response
  const createMockResponse = (): Response => {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
      sendStatus: jest.fn(),
      redirect: jest.fn(),
      render: jest.fn(),
      locals: {},
      app: {} as any,
      headersSent: false,
      ...{} as any
    } as unknown as Response;
  };

  describe('validateApiKey', () => {
    it('should validate correct API key', () => {
      process.env.INTERNAL_API_KEY = 'test-api-key';
      const req = createMockRequest({ 'x-api-key': 'test-api-key' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 401 if no API key is provided', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Debería devolver 401 si no se proporciona una clave API', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid API key', () => {
      process.env.INTERNAL_API_KEY = 'valid-key';
      const req = createMockRequest({ 'x-api-key': 'invalid-key' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
    });

    it('should return 401 if API key is invalid', () => {
      process.env.INTERNAL_API_KEY = 'valid-key';
      const req = createMockRequest({ 'x-api-key': 'invalid-key' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('Debería devolver 401 si la clave API no es válida', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      const req = createMockRequest({ 'x-api-key': 'invalid-key' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject if API_KEY is not set', () => {
      process.env.INTERNAL_API_KEY = '';
      const req = createMockRequest({ 'x-api-key': 'test-key' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
    });

    it('should call next() if API key is valid', () => {
      process.env.INTERNAL_API_KEY = 'test-key';
      const req = createMockRequest({ 'x-api-key': 'test-key' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('debe llamar a next() si la clave API es válida', () => {
      const validKey = 'valid-key-123';
      process.env.INTERNAL_API_KEY = validKey;
      const req = createMockRequest({ 'x-api-key': validKey });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should be case sensitive when comparing API keys', () => {
      process.env.INTERNAL_API_KEY = 'test-key';
      const req = createMockRequest({ 'x-api-key': 'TEST-KEY' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Debe distinguir entre mayúsculas y minúsculas al comparar claves API', () => {
      const validKey = 'valid-key-123';
      process.env.INTERNAL_API_KEY = validKey;
      const req = createMockRequest({ 'x-api-key': 'VALID-KEY-123' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('Debería devolver 401 si INTERNAL_API_KEY no está configurado', () => {
      delete process.env.INTERNAL_API_KEY;
      const req = createMockRequest({ 'x-api-key': 'test-key' });
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should maintain method chaining (status().json())', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
    });

    it('debe mantener el encadenamiento de métodos (status().json())', () => {
      process.env.INTERNAL_API_KEY = 'valid-key-123';
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      validateApiKey(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error: Invalid' });
    });
  });
});