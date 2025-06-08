import { jest } from '@jest/globals';

jest.resetModules();
jest.mock('.prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn()
  }))
}));

describe('Prisma Singleton', () => {
  let PrismaClient: any;

  beforeEach(() => {
    jest.resetModules();
    global.prisma = undefined;
    PrismaClient = require('.prisma/client').PrismaClient;
  });

  it('should create a new PrismaClient instance when none exists', () => {
    const { prisma } = require('../../lib/prisma');
    expect(prisma).toBeDefined();
    expect(PrismaClient).toHaveBeenCalledWith({
      log: ['query', 'error', 'warn']
    });
  });

  it('should reuse the same PrismaClient instance', () => {
    const { prisma: instance1 } = require('../../lib/prisma');
    const { prisma: instance2 } = require('../../lib/prisma');
    expect(instance1).toBe(instance2);
    expect(PrismaClient).toHaveBeenCalledTimes(1);
  });

  it('should store the instance in globalThis in non-production environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    global.prisma = undefined;

    const { prisma } = require('../../lib/prisma');
    expect(global.prisma).toBe(prisma);

    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should not store the instance in globalThis in production environment', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    global.prisma = undefined;

    const { prisma } = require('../../lib/prisma');
    expect(global.prisma).toBeUndefined();

    process.env.NODE_ENV = originalNodeEnv;
  });
});