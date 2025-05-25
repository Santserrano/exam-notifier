import { PrismaClient } from '@prisma/client';

interface NotificationConfig {
    webPushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    avisoPrevioHoras: number;
}

interface WebPushSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
}

class NotificationService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getConfigByProfesor(profesorId: string) {
        try {
            console.log('Buscando configuración para profesor:', profesorId);
            const config = await this.prisma.notificacionConfig.findUnique({
                where: { profesorId }
            });
            console.log('Configuración encontrada:', config);
            return config;
        } catch (error) {
            console.error('Error en getConfigByProfesor:', error);
            throw new Error('Error al obtener la configuración');
        }
    }

    async getNotifications() {
        return await this.prisma.mesaDeExamen.findMany({
            where: {
                fecha: {
                    gte: new Date()
                }
            },
            include: {
                profesor: true,
                vocal: true,
                materia: {
                    include: {
                        carrera: true
                    }
                }
            },
            orderBy: {
                fecha: 'asc'
            }
        });
    }

    async updateConfig(profesorId: string, config: NotificationConfig) {
        try {
            console.log('Actualizando configuración para profesor:', profesorId);
            const updatedConfig = await this.prisma.notificacionConfig.upsert({
                where: { profesorId },
                update: config,
                create: {
                    profesorId,
                    ...config
                }
            });
            console.log('Configuración actualizada:', updatedConfig);
            return updatedConfig;
        } catch (error) {
            console.error('Error en updateConfig:', error);
            throw new Error('Error al actualizar la configuración');
        }
    }

    async saveWebPushSubscription(profesorId: string, subscription: WebPushSubscription) {
        try {
            console.log('Guardando suscripción para profesor:', profesorId);
            const existingSubscription = await this.prisma.webPushSubscription.findFirst({
                where: { profesorId }
            });

            // Extraer solo los campos válidos
            const { endpoint, keys } = subscription;
            const { p256dh, auth } = keys;

            let savedSubscription;
            if (existingSubscription) {
                savedSubscription = await this.prisma.webPushSubscription.update({
                    where: { id: existingSubscription.id },
                    data: {
                        endpoint,
                        p256dh,
                        auth
                    }
                });
            } else {
                savedSubscription = await this.prisma.webPushSubscription.create({
                    data: {
                        profesorId,
                        endpoint,
                        p256dh,
                        auth
                    }
                });
            }
            console.log('Suscripción guardada:', savedSubscription);
            return savedSubscription;
        } catch (error) {
            console.error('Error en saveWebPushSubscription:', error);
            throw new Error('Error al guardar la suscripción');
        }
    }

    async getWebPushSubscriptions(profesorId: string) {
        try {
            console.log('Buscando suscripciones para profesor:', profesorId);
            const subscriptions = await this.prisma.webPushSubscription.findMany({
                where: { profesorId }
            });
            console.log('Suscripciones encontradas:', subscriptions);
            return subscriptions;
        } catch (error) {
            console.error('Error en getWebPushSubscriptions:', error);
            throw new Error('Error al obtener las suscripciones');
        }
    }

    async deleteWebPushSubscription(id: string) {
        try {
            console.log('Eliminando suscripción:', id);
            const deletedSubscription = await this.prisma.webPushSubscription.delete({
                where: { id }
            });
            console.log('Suscripción eliminada:', deletedSubscription);
            return deletedSubscription;
        } catch (error) {
            console.error('Error en deleteWebPushSubscription:', error);
            throw new Error('Error al eliminar la suscripción');
        }
    }
}

export const notificacionService = new NotificationService();
