import { MesaDeExamen, PrismaClient } from '@prisma/client';
import { notificationFactory } from '../core/notifications/NotificationFactory.js';
import { notificacionService } from './NotificationService.js';

interface MesaData {
    id: number;
    profesor: string;
    vocal: string;
    carrera: string;
    materia: string;
    fecha: Date;
    descripcion: string;
    cargo: string;
    verification: boolean;
    createdAt: Date;
    modalidad?: string | null;
    aula?: string | null;
    webexLink?: string | null;
}

interface MesaResponse {
    success: boolean;
    data?: MesaData;
    error?: string;
}

class MesaService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }

    async getAllMesas(): Promise<MesaDeExamen[]> {
        try {
            console.log('Iniciando getAllMesas...');
            const mesas = await this.prisma.mesaDeExamen.findMany({
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    }
                }
            });
            console.log('Mesas encontradas:', mesas);
            return mesas;
        } catch (error) {
            console.error('Error en getAllMesas:', error);
            throw new Error('Error al obtener las mesas');
        }
    }

    async getMesasByProfesorId(profesorId: string): Promise<MesaDeExamen[]> {
        try {
            console.log('Buscando mesas para profesor:', profesorId);
            const mesas = await this.prisma.mesaDeExamen.findMany({
                where: {
                    OR: [
                        { profesorId },
                        { vocalId: profesorId }
                    ]
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    },
                    carrera: true
                }
            });
            console.log('Mesas encontradas para profesor:', mesas);
            return mesas;
        } catch (error) {
            console.error('Error en getMesasByProfesorId:', error);
            throw new Error('Error al obtener las mesas del profesor');
        }
    }

    async getMesaById(id: number): Promise<MesaDeExamen | null> {
        try {
            return await this.prisma.mesaDeExamen.findUnique({
                where: { id },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error('Error al obtener la mesa');
        }
    }

    async createMesa(data: Omit<MesaData, 'id' | 'createdAt'>): Promise<MesaResponse> {
        try {
            // Verificar que la materia existe
            const materia = await this.prisma.materia.findUnique({
                where: {
                    id: data.materia
                }
            });

            if (!materia) {
                throw new Error('Materia no encontrada');
            }

            const nuevaMesa = await this.prisma.mesaDeExamen.create({
                data: {
                    profesorId: data.profesor,
                    vocalId: data.vocal,
                    carreraId: data.carrera,
                    materiaId: data.materia,
                    fecha: data.fecha,
                    descripcion: data.descripcion || 'Mesa de examen',
                    cargo: data.cargo || 'Titular',
                    verification: data.verification || true,
                    modalidad: data.modalidad,
                    aula: data.aula,
                    webexLink: data.webexLink
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    },
                    carrera: true
                }
            });

            const config = await notificacionService.getConfigByProfesor(data.profesor);
            if (config?.webPushEnabled) {
                const fechaFormateada = new Date(data.fecha).toLocaleDateString();
                const pushNotification = notificationFactory.createNotification('push', {
                    title: 'Nueva mesa asignada',
                    body: `Se te asignó una mesa de ${nuevaMesa.materia.nombre} (${nuevaMesa.carrera.nombre}) para el ${fechaFormateada} en modalidad ${nuevaMesa.modalidad || 'Presencial'}`,
                    recipient: data.profesor
                });
                await pushNotification.send();
            }

            // Enviar notificación al vocal
            const configVocal = await notificacionService.getConfigByProfesor(data.vocal);
            if (configVocal?.webPushEnabled) {
                const fechaFormateada = new Date(data.fecha).toLocaleDateString();
                const pushNotification = notificationFactory.createNotification('push', {
                    title: 'Nueva mesa asignada',
                    body: `Se te asignó como vocal en una mesa de ${nuevaMesa.materia.nombre} (${nuevaMesa.carrera.nombre}) para el ${fechaFormateada} en modalidad ${nuevaMesa.modalidad || 'Presencial'}`,
                    recipient: data.vocal
                });
                await pushNotification.send();
            }

            const profesorData = await this.prisma.profesor.findUnique({
                where: { id: data.profesor }
            });

            if (profesorData) {
                const fechaObj = new Date(data.fecha);
                const fechaFormateada = fechaObj.toLocaleDateString();
                const horaFormateada = fechaObj.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                });

                const notificationData = {
                    title: 'Nueva mesa asignada',
                    body: `Hola ${profesorData.nombre}, se te ha asignado una nueva mesa: ${nuevaMesa.materia.nombre} el ${fechaFormateada} a las ${horaFormateada}`,
                    recipient: data.profesor,
                    metadata: {
                        mesaId: nuevaMesa.id,
                        materia: nuevaMesa.materia.nombre,
                        fecha: fechaFormateada,
                        hora: horaFormateada
                    }
                };

                // Enviar notificaciones según la configuración
                if (config?.webPushEnabled) {
                    const pushNotification = notificationFactory.createNotification('push', notificationData);
                    await pushNotification.send();
                }

                if (profesorData.email && config?.emailEnabled) {
                    const emailNotification = notificationFactory.createNotification('email', {
                        ...notificationData,
                        recipient: profesorData.email
                    });
                    await emailNotification.send();
                }

                if (profesorData.telefono && config?.smsEnabled) {
                    const whatsappNotification = notificationFactory.createNotification('whatsapp', {
                        ...notificationData,
                        recipient: profesorData.telefono
                    });
                    await whatsappNotification.send();
                }
            }

            return {
                success: true,
                data: {
                    id: nuevaMesa.id,
                    profesor: nuevaMesa.profesorId,
                    vocal: nuevaMesa.vocalId,
                    carrera: nuevaMesa.carreraId,
                    materia: nuevaMesa.materiaId,
                    fecha: nuevaMesa.fecha,
                    descripcion: nuevaMesa.descripcion,
                    cargo: nuevaMesa.cargo,
                    verification: nuevaMesa.verification,
                    createdAt: nuevaMesa.createdAt,
                    modalidad: nuevaMesa.modalidad || null,
                    aula: nuevaMesa.aula || null,
                    webexLink: nuevaMesa.webexLink || null
                }
            };
        } catch (error) {
            return { success: false, error: 'Error al crear la mesa' };
        }
    }

    async updateMesa(id: number, data: Partial<MesaData>): Promise<MesaResponse> {
        try {
            const updatedMesa = await this.prisma.mesaDeExamen.update({
                where: { id },
                data: {
                    profesorId: data.profesor,
                    vocalId: data.vocal,
                    carreraId: data.carrera,
                    materiaId: data.materia,
                    fecha: data.fecha,
                    descripcion: data.descripcion,
                    cargo: data.cargo,
                    verification: data.verification,
                    modalidad: data.modalidad,
                    aula: data.aula,
                    webexLink: data.webexLink
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    },
                    carrera: true
                }
            });

            return {
                success: true,
                data: {
                    id: updatedMesa.id,
                    profesor: updatedMesa.profesorId,
                    vocal: updatedMesa.vocalId,
                    carrera: updatedMesa.carreraId,
                    materia: updatedMesa.materiaId,
                    fecha: updatedMesa.fecha,
                    descripcion: updatedMesa.descripcion,
                    cargo: updatedMesa.cargo,
                    verification: updatedMesa.verification,
                    createdAt: updatedMesa.createdAt,
                    modalidad: updatedMesa.modalidad || null,
                    aula: updatedMesa.aula || null,
                    webexLink: updatedMesa.webexLink || null
                }
            };
        } catch (error) {
            return { success: false, error: 'Error al actualizar la mesa' };
        }
    }

    async deleteMesa(id: number): Promise<MesaDeExamen | null> {
        try {
            return await this.prisma.mesaDeExamen.delete({
                where: { id },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true
                        }
                    }
                }
            });
        } catch (error) {
            throw new Error('Error al eliminar la mesa');
        }
    }
}

export const mesaService = new MesaService(); 