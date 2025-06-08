import { jest } from '@jest/globals';
import request from 'supertest';
import { app } from '../index';
import diaryRouter from '../routes/diaries.js';
import notificationsRouter from '../routes/notifications.js';

// Mock de los routers
jest.mock('../routes/diaries.js', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        use: jest.fn()
    }))
}));

jest.mock('../routes/notifications.js', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        use: jest.fn()
    }))
}));

describe('Express App', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('CORS Configuration', () => {
        it('should allow localhost in development', async () => {
            process.env.NODE_ENV = 'development';
            const response = await request(app)
                .get('/health')
                .set('Origin', 'http://localhost:3000');

            expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
        });

        it('should allow production URL in production', async () => {
            process.env.NODE_ENV = 'production';
            process.env.FRONTEND_URL = 'https://ucpmesas.site';

            const response = await request(app)
                .get('/health')
                .set('Origin', 'https://ucpmesas.site');

            expect(response.headers['access-control-allow-origin']).toBe('https://ucpmesas.site');
        });

        it('should reject unauthorized origins', async () => {
            const response = await request(app)
                .get('/health')
                .set('Origin', 'https://malicious-site.com');

            expect(response.headers['access-control-allow-origin']).toBeUndefined();
        });
    });

    describe('Health Check', () => {
        it('should return 200 OK for health check', async () => {
            const response = await request(app).get('/health');
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ status: 'ok' });
        });
    });

    describe('Routes', () => {
        it('should use diary router', () => {
            expect(diaryRouter.use).toHaveBeenCalled();
        });

        it('should use notifications router', () => {
            expect(notificationsRouter.use).toHaveBeenCalled();
        });
    });

    describe('Server Start', () => {
        const originalConsoleLog = console.log;
        let consoleOutput: string[] = [];

        beforeEach(() => {
            consoleOutput = [];
            console.log = jest.fn((...args) => {
                consoleOutput.push(args.join(' '));
            });
        });

        afterEach(() => {
            console.log = originalConsoleLog;
        });

        it('should not start server in test environment', () => {
            process.env.NODE_ENV = 'test';
            process.env.PORT = '3005';

            // Importar el módulo nuevamente para ejecutar el código de inicio
            jest.isolateModules(() => {
                require('../index');
            });

            expect(consoleOutput).not.toContain('Servidor corriendo en http://localhost:3005');
        });

        it('should start server in non-test environment', () => {
            process.env.NODE_ENV = 'development';
            process.env.PORT = '3005';

            // Importar el módulo nuevamente para ejecutar el código de inicio
            jest.isolateModules(() => {
                require('../index');
            });

            expect(consoleOutput).toContain('Servidor corriendo en http://localhost:3005');
        });
    });
}); 