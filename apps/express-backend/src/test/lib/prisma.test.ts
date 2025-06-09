import { jest } from '@jest/globals';

import { prisma } from '../../lib/prisma';
import { PrismaClient } from '.prisma/client';

// Mock de PrismaClient
jest.mock('.prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        $connect: jest.fn(),
        $disconnect: jest.fn()
    }))
}));

describe('Prisma Singleton', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Limpiar la instancia global antes de cada prueba
        global.prisma = undefined;
    });

    it('should create a new PrismaClient instance when none exists', () => {
        prisma;
        expect(prisma).toBeDefined();
        expect(PrismaClient).toHaveBeenCalledWith({
            log: ['query', 'error', 'warn']
        });
    });

    it('should reuse the same PrismaClient instance', () => {
        const instance1 = prisma;
        const instance2 = prisma;
        expect(instance1).toBe(instance2);
        expect(PrismaClient).toHaveBeenCalledTimes(1);
    });

    it('should store the instance in globalThis in non-production environment', () => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        prisma;
        expect(global.prisma).toBe(prisma);

        process.env.NODE_ENV = originalNodeEnv;
    });

    it('should not store the instance in globalThis in production environment', () => {
        const originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';

        prisma;
        expect(global.prisma).toBeUndefined();

        process.env.NODE_ENV = originalNodeEnv;
    });
}); 