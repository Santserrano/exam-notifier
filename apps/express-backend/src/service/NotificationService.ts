import { PrismaClient } from "@prisma/client";

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
      // Verificar que el profesor existe en nuestra DB
      const profesor = await this.prisma.profesor.findUnique({
        where: { id: profesorId },
      });

      // Si no existe en nuestra DB, es un admin u otro tipo de usuario
      if (!profesor) {
        return {
          webPushEnabled: false,
          emailEnabled: false,
          smsEnabled: false,
          avisoPrevioHoras: 24,
        };
      }

      // Si es profesor, buscar o crear su configuración
      const config = await this.prisma.notificacionConfig.findUnique({
        where: { profesorId },
      });

      if (!config) {
        try {
          return await this.prisma.notificacionConfig.create({
            data: {
              profesorId,
              webPushEnabled: false,
              emailEnabled: false,
              smsEnabled: false,
              avisoPrevioHoras: 24,
            },
          });
        } catch (createError) {
          console.error("Error al crear configuración:", createError);
          return {
            webPushEnabled: false,
            emailEnabled: false,
            smsEnabled: false,
            avisoPrevioHoras: 24,
          };
        }
      }

      return config;
    } catch (error) {
      return {
        webPushEnabled: false,
        emailEnabled: false,
        smsEnabled: false,
        avisoPrevioHoras: 24,
      };
    }
  }

  async getNotifications() {
    return await this.prisma.mesaDeExamen.findMany({
      where: {
        fecha: {
          gte: new Date(),
        },
      },
      include: {
        profesor: true,
        vocal: true,
        materia: {
          include: {
            carrera: true,
          },
        },
      },
      orderBy: {
        fecha: "asc",
      },
    });
  }

  async updateConfig(profesorId: string, config: NotificationConfig) {
    try {
      const updatedConfig = await this.prisma.notificacionConfig.upsert({
        where: { profesorId },
        update: config,
        create: {
          profesorId,
          ...config,
        },
      });
      return updatedConfig;
    } catch (error) {
      throw new Error("Error al actualizar la configuración");
    }
  }

  async saveWebPushSubscription(
    profesorId: string,
    subscription: WebPushSubscription,
  ) {
    try {
      const existingSubscription =
        await this.prisma.webPushSubscription.findFirst({
          where: { profesorId },
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
            auth,
          },
        });
      } else {
        savedSubscription = await this.prisma.webPushSubscription.create({
          data: {
            profesorId,
            endpoint,
            p256dh,
            auth,
          },
        });
      }
      return savedSubscription;
    } catch (error) {
      throw new Error("Error al guardar la suscripción");
    }
  }

  async getWebPushSubscriptions(profesorId: string) {
    try {
      const subscriptions = await this.prisma.webPushSubscription.findMany({
        where: { profesorId },
      });
      return subscriptions;
    } catch (error) {
      throw new Error("Error al obtener las suscripciones");
    }
  }

  async deleteWebPushSubscription(id: string) {
    try {
      const deletedSubscription = await this.prisma.webPushSubscription.delete({
        where: { id },
      });
      return deletedSubscription;
    } catch (error) {
      throw new Error("Error al eliminar la suscripción");
    }
  }
}

export const notificacionService = new NotificationService();
