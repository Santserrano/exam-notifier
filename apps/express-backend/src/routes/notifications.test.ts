import request from 'supertest';
import express from 'express';
import notificationsRouter from './notifications';
import { notificacionService } from '../service/NotificationService';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';

// Mock del servicio de notificaciones
jest.mock('../service/NotificationService', () => ({
    notificacionService: {
        getConfigByProfesor: jest.fn(),
        saveWebPushSubscription: jest.fn(),
        updateConfig: jest.fn()
    }
}));

describe('Notifications Router', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api', notificationsRouter);
    });

    describe('POST /api/notificaciones/push-subscription', () => {
        it('debería guardar una suscripción push correctamente', async () => {
            const mockSubscription = {
                id: 1,
                profesorId: '123',
                endpoint: 'https://fcm.googleapis.com/fcm/send/...',
                p256dh: 'key1',
                auth: 'key2'
            };

            (notificacionService.saveWebPushSubscription as jest.Mock).mockResolvedValue(mockSubscription);

            const response = await request(app)
                .post('/api/notificaciones/push-subscription')
                .set('x-api-key', 'test-api-key')
                .send({
                    profesorId: '123',
                    subscription: {
                        endpoint: 'https://fcm.googleapis.com/fcm/send/...',
                        keys: {
                            p256dh: 'key1',
                            auth: 'key2'
                        }
                    }
                });

            expect(response.status).toBe(201);
            expect(response.body).toEqual(mockSubscription);
        });

        it('debería retornar error 400 si faltan datos requeridos', async () => {
            const response = await request(app)
                .post('/api/notificaciones/push-subscription')
                .set('x-api-key', 'test-api-key')
                .send({
                    profesorId: '123'
                    // Falta subscription
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Faltan datos requeridos');
        });

        it('debería retornar error 500 si hay un error al guardar la suscripción', async () => {
            (notificacionService.saveWebPushSubscription as jest.Mock).mockRejectedValue(new Error('Error de base de datos'));

            const response = await request(app)
                .post('/api/notificaciones/push-subscription')
                .set('x-api-key', 'test-api-key')
                .send({
                    profesorId: '123',
                    subscription: {
                        endpoint: 'https://fcm.googleapis.com/fcm/send/...',
                        keys: {
                            p256dh: 'key1',
                            auth: 'key2'
                        }
                    }
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Error al guardar suscripción');
        });
    });
}); 