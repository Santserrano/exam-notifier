import { MesaDeExamen, Prisma, Profesor, Carrera, Materia } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { notificationFactory } from '../core/notifications/NotificationFactory.js';
import { notificacionService } from './NotificationService.js';

type MesaCreateInput = {
    profesor: string;
    vocal: string;
    carrera: string;
    materia: string;
    fecha: string;
    descripcion?: string;
    cargo?: string;
    verification?: boolean;
    modalidad?: string;
    aula?: string;
    webexLink?: string;
};

type MesaWithRelations = Prisma.MesaDeExamenGetPayload<{
    include: {
        profesor: true;
        vocal: true;
        materia: {
            include: {
                carrera: true;
            };
        };
        carrera: true;
    };
}>;

interface MesaResponse {
    success: boolean;
    data?: MesaWithRelations;
    error?: string;
}

class MesaService {
    async getAllMesas(): Promise<MesaWithRelations[]> {
        try {
            const mesas = await prisma.mesaDeExamen.findMany({
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
            return mesas;
        } catch (error) {
            throw new Error('Error al obtener las mesas');
        }
    }

    async getMesasByProfesorId(profesorId: string): Promise<MesaDeExamen[]> {
        try {
            const mesas = await prisma.mesaDeExamen.findMany({
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
            return mesas;
        } catch (error) {
            throw new Error('Error al obtener las mesas del profesor');
        }
    }

    async getMesaById(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.findUnique({
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

    async createMesa(data: MesaCreateInput): Promise<MesaResponse> {
        try {
            // Validar datos requeridos
            if (!data.profesor || !data.vocal || !data.carrera || !data.materia || !data.fecha) {
                throw new Error("Faltan datos requeridos");
            }

            // Verificar que el profesor existe
            const profesor = await prisma.profesor.findUnique({
                where: { id: data.profesor },
            });
            if (!profesor) {
                throw new Error("Profesor no encontrado");
            }

            // Verificar que el vocal existe
            const vocal = await prisma.profesor.findUnique({
                where: { id: data.vocal },
            });
            if (!vocal) {
                throw new Error("Vocal no encontrado");
            }

            // Verificar que la carrera existe
            const carrera = await prisma.carrera.findUnique({
                where: { id: data.carrera },
            });
            if (!carrera) {
                throw new Error("Carrera no encontrada");
            }

            // Verificar que la materia existe
            const materia = await prisma.materia.findUnique({
                where: { id: data.materia },
                include: { carrera: true },
            });
            if (!materia) {
                throw new Error("Materia no encontrada");
            }

            const nuevaMesa = await prisma.mesaDeExamen.create({
                data: {
                    profesor: { connect: { id: data.profesor } },
                    vocal: { connect: { id: data.vocal } },
                    carrera: { connect: { id: data.carrera } },
                    materia: { connect: { id: data.materia } },
                    fecha: new Date(data.fecha),
                    descripcion: data.descripcion || "Mesa de examen",
                    cargo: data.cargo || "Titular",
                    verification: data.verification ?? false,
                    modalidad: data.modalidad || "Presencial",
                    aula: data.modalidad === "Presencial" ? data.aula : undefined,
                    webexLink: data.modalidad === "Virtual" ? data.webexLink : undefined,
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true,
                        },
                    },
                    carrera: true,
                },
            });

            // Obtener datos del profesor y vocal
            const [profesorData, vocalData] = await Promise.all([
                prisma.profesor.findUnique({ where: { id: data.profesor } }),
                prisma.profesor.findUnique({ where: { id: data.vocal } })
            ]);

            if (!profesorData || !vocalData) {
                throw new Error('Profesor o vocal no encontrado');
            }

            // Preparar datos comunes para las notificaciones
            const fechaObj = new Date(data.fecha);
            const fechaFormateada = fechaObj.toLocaleString('es-AR', {
                timeZone: 'America/Argentina/Buenos_Aires',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Obtener configuraciones de notificaciones
            const [configProfesor, configVocal] = await Promise.all([
                notificacionService.getConfigByProfesor(data.profesor),
                notificacionService.getConfigByProfesor(data.vocal)
            ]);

            // Enviar notificaciones al profesor
            if (configProfesor) {
                try {
                    const notificationData = {
                        title: 'Nueva mesa asignada',
                        body: `Hola ${profesorData.nombre}, se te ha asignado una nueva mesa: ${nuevaMesa.materia.nombre} el ${fechaFormateada}`,
                        recipient: data.profesor,
                        metadata: {
                            mesaId: nuevaMesa.id,
                            materia: nuevaMesa.materia.nombre,
                            fecha: fechaFormateada
                        }
                    };

                    // Enviar notificaciones según la configuración
                    if (configProfesor.webPushEnabled) {
                        const pushNotification = notificationFactory.createNotification('push', notificationData);
                        await pushNotification.send();
                    }

                    if (profesorData.email && configProfesor.emailEnabled) {
                        const emailNotification = notificationFactory.createNotification('email', {
                            ...notificationData,
                            recipient: profesorData.email
                        });
                        await emailNotification.send();
                    }

                    if (profesorData.telefono && configProfesor.smsEnabled) {
                        const whatsappNotification = notificationFactory.createNotification('whatsapp', {
                            ...notificationData,
                            recipient: profesorData.telefono
                        });
                        await whatsappNotification.send();
                    }
                } catch (error) {
                    throw new Error('Error al enviar notificaciones al profesor:');
                }
            }

            // Enviar notificaciones al vocal
            if (configVocal) {
                try {
                    const notificationData = {
                        title: 'Nueva mesa asignada',
                        body: `Hola ${vocalData.nombre}, se te ha asignado una nueva mesa: ${nuevaMesa.materia.nombre} el ${fechaFormateada}`,
                        recipient: data.vocal,
                        metadata: {
                            mesaId: nuevaMesa.id,
                            materia: nuevaMesa.materia.nombre,
                            fecha: fechaFormateada
                        }
                    };

                    // Enviar notificaciones según la configuración
                    if (configVocal.webPushEnabled) {
                        const pushNotification = notificationFactory.createNotification('push', notificationData);
                        await pushNotification.send();
                    }

                    if (vocalData.email && configVocal.emailEnabled) {
                        const emailNotification = notificationFactory.createNotification('email', {
                            ...notificationData,
                            recipient: vocalData.email
                        });
                        await emailNotification.send();
                    }

                    if (vocalData.telefono && configVocal.smsEnabled) {
                        const whatsappNotification = notificationFactory.createNotification('whatsapp', {
                            ...notificationData,
                            recipient: vocalData.telefono
                        });
                        await whatsappNotification.send();
                    }
                } catch (error) {
                    throw new Error('Error al enviar notificaciones al vocal:');
                }
            }

            return {
                success: true,
                data: nuevaMesa
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al crear la mesa'
            };
        }
    }

    async updateMesa(id: number, data: Partial<MesaCreateInput>): Promise<MesaResponse> {
        try {
            const mesaActualizada = await prisma.mesaDeExamen.update({
                where: { id },
                data: {
                    profesorId: data.profesor,
                    vocalId: data.vocal,
                    carreraId: data.carrera,
                    materiaId: data.materia,
                    fecha: data.fecha ? new Date(data.fecha) : undefined,
                    descripcion: data.descripcion,
                    cargo: data.cargo,
                    verification: data.verification,
                    modalidad: data.modalidad,
                    aula: data.modalidad === "Presencial" ? data.aula : undefined,
                    webexLink: data.modalidad === "Virtual" ? data.webexLink : undefined,
                },
                include: {
                    profesor: true,
                    vocal: true,
                    materia: {
                        include: {
                            carrera: true,
                        },
                    },
                    carrera: true,
                },
            });

            return {
                success: true,
                data: mesaActualizada,
            };
        } catch (error) {
            throw error;
        }
    }

    async deleteMesa(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.delete({
                where: { id }
            });
        } catch (error) {
            throw new Error('Error al eliminar la mesa');
        }
    }
}

export const mesaService = new MesaService(); 