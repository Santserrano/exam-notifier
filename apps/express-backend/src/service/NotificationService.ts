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
        return await prisma.notificacionConfig.upsert({
            where: { profesorId },
            update: { ...config },
            create: {
                profesorId,
                ...config,
            },
        });
    }

    async saveWebPushSubscription(profesorId: string, endpoint: string, keys: any) {
        return await prisma.webPushSubscription.create({
            data: {
                profesorId,
                endpoint,
                auth: keys.auth,
                p256dh: keys.p256dh,
            },
        });
    }

    async getWebPushSubscriptions(profesorId: string) {
        return await prisma.webPushSubscription.findMany({
            where: { profesorId },
        });
    }
}

export const notificacionService = new NotificacionService();
