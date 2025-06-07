import { jest } from '@jest/globals';
import { createClient } from 'redis';
import { redis, initRedis } from '../../lib/redis.js';

// Mock de Redis
jest.mock('redis', () => {
  return {
    createClient: jest.fn(() => ({
      connect: jest.fn(),
      quit: jest.fn(),
      on: jest.fn(),
      isOpen: false,
      options: {}
    }))
  };
});

describe('Módulo Redis', () => {
  let mockRedis: any;

  beforeAll(() => {
    process.env.REDIS_URL = 'redis://localhost:6379';
    mockRedis = createClient();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Redis Client', () => {
    it('should throw error if REDIS_URL is not defined', async () => {
      const originalUrl = process.env.REDIS_URL;
      delete process.env.REDIS_URL;
      
      await expect(async () => {
        await import('../../lib/redis.js');
      }).rejects.toThrow('REDIS_URL no está definida');
      
      process.env.REDIS_URL = originalUrl;
    });

    it('should create a redis client with the correct URL', () => {
      expect(redis).toBeDefined();
      expect(createClient).toHaveBeenCalledWith({
        url: process.env.REDIS_URL
      });
    });
  });

  describe('initRedis', () => {
    it('should connect to redis successfully', async () => {
      mockRedis.connect.mockResolvedValueOnce(true);
      await expect(initRedis()).resolves.not.toThrow();
      expect(mockRedis.connect).toHaveBeenCalled();
    });

    it('should throw Error when connection fails', async () => {
      const testError = new Error('Connection failed');
      mockRedis.connect.mockRejectedValueOnce(testError);
      
      await expect(initRedis()).rejects.toThrow(Error);
      await expect(initRedis()).rejects.toThrow('Redis falló');
    });
  });

  describe('Redis Error Handling', () => {
    it('should log errors when they occur', () => {
      const consoleSpy = jest.spyOn(console, 'error');
      const testError = new Error('Test error');
      
      // Simular evento de error con tipado explícito
      const errorCallback = mockRedis.on.mock.calls.find(
        (call: [string, (err: Error) => void]) => call[0] === 'error'
      )?.[1];
      
      if (!errorCallback) {
        throw new Error('Error callback not found');
      }
      
      errorCallback(testError);
      
      expect(consoleSpy).toHaveBeenCalledWith('Redis Client Error', testError);
    });
  });
});