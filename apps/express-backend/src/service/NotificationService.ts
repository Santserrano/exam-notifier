import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class NotificacionService {
    async getConfigByProfesor(profesorId: string) {
        return await prisma.notificacionConfig.findUnique({
            where: { profesorId },
        });
    }

    async updateConfig(profesorId: string, config: Partial<{
        webPushEnabled: boolean;
        emailEnabled: boolean;
        smsEnabled: boolean;
        reminderMinutes: number;
    }>) {
        console.log('Actualizando configuración para profesor:', profesorId, 'con config:', config);

        try {
            // Verificamos si ya existe la configuración
            const existing = await prisma.notificacionConfig.findUnique({
                where: { profesorId }
            });

            // Armamos los datos de actualización/creación
            const data: any = {};
            if (typeof config.webPushEnabled !== 'undefined') data.webPushEnabled = config.webPushEnabled;
            if (typeof config.emailEnabled !== 'undefined') data.emailEnabled = config.emailEnabled;
            if (typeof config.smsEnabled !== 'undefined') data.smsEnabled = config.smsEnabled;
            if (typeof config.reminderMinutes !== 'undefined') {
                data.avisoPrevioHoras = Math.floor(config.reminderMinutes / 60);
            }
            data.updatedAt = new Date();

            // Si ya existe, actualizamos solo los campos enviados
            if (existing) {
                const result = await prisma.notificacionConfig.update({
                    where: { profesorId },
                    data,
                });
                return result;
            } else {
                // Si no existe, creamos con valores por defecto para los que no se envíen
                const result = await prisma.notificacionConfig.create({
                    data: {
                        profesorId,
                        webPushEnabled: config.webPushEnabled ?? false,
                        emailEnabled: config.emailEnabled ?? false,
                        smsEnabled: config.smsEnabled ?? false,
                        avisoPrevioHoras: config.reminderMinutes ? Math.floor(config.reminderMinutes / 60) : 24,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
                });
                return result;
            }
        } catch (error) {
            console.error('Error al actualizar configuración:', error);
            throw error;
        }
    }


    async saveWebPushSubscription(profesorId: string, endpoint: string, keys: any) {
        console.log('Guardando suscripción push para profesor:', profesorId);

        try {
            // Primero verificamos si el profesor existe
            const profesor = await prisma.profesor.findUnique({
                where: { id: profesorId }
            });

            if (!profesor) {
                throw new Error('Profesor no encontrado');
            }

            // Actualizamos la configuración para habilitar webPush
            await this.updateConfig(profesorId, {
                webPushEnabled: true,
                emailEnabled: false,
                smsEnabled: false
            });

            const result = await prisma.webPushSubscription.create({
                data: {
                    profesorId,
                    endpoint,
                    auth: keys.auth,
                    p256dh: keys.p256dh,
                    createdAt: new Date()
                },
            });

            console.log('Suscripción push guardada:', result);
            return result;
        } catch (error) {
            console.error('Error al guardar suscripción push:', error);
            throw error;
        }
    }

    async getWebPushSubscriptions(profesorId: string) {
        return await prisma.webPushSubscription.findMany({
            where: { profesorId },
        });
    }

    async deleteWebPushSubscription(id: string) {
        return await prisma.webPushSubscription.delete({
            where: { id },
        });
    }
}

export const notificacionService = new NotificacionService();
