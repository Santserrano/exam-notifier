import { PrismaClient, MesaDeExamen, Profesor } from '@prisma/client';
import { sendPushToProfesor } from './SendPushNotification';
import { notificacionService } from './NotificationService';
import { enviarEmailNotificacion } from './emailService';
import { enviarWhatsapp } from './whatsappService';
// Singleton para el cliente Prisma
const prisma = new PrismaClient();

export class MesaService {
    async getAllMesas(): Promise<MesaDeExamen[]> {
        try {
            return await prisma.mesaDeExamen.findMany({
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error('Error al obtener todas las mesas:', error);
            throw new Error('Error al obtener las mesas');
        }
    }

    async getMesasByProfesorId(profesorId: string): Promise<MesaDeExamen[]> {
        try {
            return await prisma.mesaDeExamen.findMany({
                where: {
                    OR: [
                        { profesorId },
                        { vocalId: profesorId }
                    ]
                },
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error(`Error al obtener mesas del profesor ${profesorId}:`, error);
            throw new Error('Error al obtener las mesas del profesor');
        }
    }

    async getMesaById(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.findUnique({
                where: { id },
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error(`Error al obtener mesa con id ${id}:`, error);
            throw new Error('Error al obtener la mesa');
        }
    }

    async createMesa(data: Omit<MesaDeExamen, "id" | "createdAt" | "updatedAt">): Promise<MesaDeExamen> {
        try {
            // Extraer los IDs y el resto de los datos
            const { profesor, vocal, ...rest } = data as any;
            const nuevaMesa = await prisma.mesaDeExamen.create({
                data: {
                    ...rest,
                    profesor: { connect: { id: profesor } },
                    vocal: { connect: { id: vocal } }
                },
                include: {
                    profesor: true,
                    vocal: true
                }
            });

            const config = await notificacionService.getConfigByProfesor(profesor);
            if (config?.webPushEnabled) {
                const fechaFormateada = new Date(data.fecha).toLocaleDateString();
                await sendPushToProfesor(
                    profesor,
                    'Nueva mesa asignada',
                    `Se te asignó una mesa de ${nuevaMesa.materia} (${nuevaMesa.carrera}) para el ${fechaFormateada} en modalidad ${nuevaMesa.modalidad || 'Presencial'}`
                );
            }

            // Enviar notificación al vocal
            const configVocal = await notificacionService.getConfigByProfesor(vocal);
            if (configVocal?.webPushEnabled) {
                const fechaFormateada = new Date(data.fecha).toLocaleDateString();
                await sendPushToProfesor(
                    vocal,
                    'Nueva mesa asignada',
                    `Se te asignó como vocal en una mesa de ${nuevaMesa.materia} (${nuevaMesa.carrera}) para el ${fechaFormateada} en modalidad ${nuevaMesa.modalidad || 'Presencial'}`
                );
            }

            const profesorData = await prisma.profesor.findUnique({ where: { id: profesor } });
            if (profesorData) {
                const fechaFormateada = new Date(data.fecha).toLocaleDateString();
                const contenido = `Hola ${profesorData.nombre}, se te ha asignado una nueva mesa: ${nuevaMesa.materia} el ${fechaFormateada}`;
                if (profesorData.email) {
                    await enviarEmailNotificacion(profesorData.email, contenido);
                }
                if (profesorData.telefono) {
                    await enviarWhatsapp(profesorData.telefono, contenido);
                }
            }

            return nuevaMesa;
        } catch (error) {
            console.error('Error al crear mesa:', error);
            throw new Error('Error al crear la mesa');
        }
    }

    async updateMesa(id: number, data: Partial<MesaDeExamen>): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.update({
                where: { id },
                data,
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error(`Error al actualizar mesa con id ${id}:`, error);
            throw new Error('Error al actualizar la mesa');
        }
    }

    async deleteMesa(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.delete({
                where: { id },
                include: {
                    profesor: true,
                    vocal: true
                }
            });
        } catch (error) {
            console.error(`Error al eliminar mesa con id ${id}:`, error);
            throw new Error('Error al eliminar la mesa');
        }
    }
}

export const mesaService = new MesaService(); 