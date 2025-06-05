import { MesaDeExamen } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
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
    async getAllMesas(): Promise<MesaDeExamen[]> {
        try {
            const mesas = await prisma.mesaDeExamen.findMany({
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
            return mesas;
        } catch (error) {
            console.error('Error en getAllMesas:', error);
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
            console.error('Error en getMesasByProfesorId:', error);
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

    async createMesa(data: Omit<MesaData, 'id' | 'createdAt'>): Promise<MesaResponse> {
        try {
            console.log('Datos recibidos en createMesa:', data);

            // Validar datos requeridos
            if (!data.profesor || !data.vocal || !data.carrera || !data.materia || !data.fecha) {
                throw new Error('Faltan datos requeridos');
            }

            // Verificar que la materia existe
            const materia = await prisma.materia.findUnique({
                where: {
                    id: data.materia
                }
            });

            if (!materia) {
                throw new Error('Materia no encontrada');
            }

            // Verificar que los profesores existen
            const [profesor, vocal] = await Promise.all([
                prisma.profesor.findUnique({ where: { id: data.profesor } }),
                prisma.profesor.findUnique({ where: { id: data.vocal } })
            ]);

            if (!profesor || !vocal) {
                throw new Error('Uno o ambos profesores no existen');
            }

            // Verificar que la carrera existe
            const carrera = await prisma.carrera.findUnique({
                where: { id: data.carrera }
            });

            if (!carrera) {
                throw new Error('Carrera no encontrada');
            }

            console.log('Creando nueva mesa con datos:', {
                profesorId: data.profesor,
                vocalId: data.vocal,
                carreraId: data.carrera,
                materiaId: data.materia,
                fecha: new Date(data.fecha),
                descripcion: data.descripcion || 'Mesa de examen',
                cargo: data.cargo || 'Titular',
                verification: data.verification ?? true,
                modalidad: data.modalidad,
                aula: data.aula,
                webexLink: data.webexLink
            });

            const nuevaMesa = await prisma.mesaDeExamen.create({
                data: {
                    profesorId: data.profesor,
                    vocalId: data.vocal,
                    carreraId: data.carrera,
                    materiaId: data.materia,
                    fecha: new Date(data.fecha),
                    descripcion: data.descripcion || 'Mesa de examen',
                    cargo: data.cargo || 'Titular',
                    verification: data.verification ?? true,
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

            console.log('Mesa creada exitosamente:', nuevaMesa);

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
            const fechaFormateada = fechaObj.toLocaleDateString();
            const horaFormateada = fechaObj.toLocaleTimeString([], {
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
                    console.error('Error al enviar notificaciones al profesor:', error);
                }
            }

            // Enviar notificaciones al vocal
            if (configVocal) {
                try {
                    const notificationData = {
                        title: 'Nueva mesa asignada',
                        body: `Hola ${vocalData.nombre}, se te ha asignado como vocal en una mesa de ${nuevaMesa.materia.nombre} (${nuevaMesa.carrera.nombre}) para el ${fechaFormateada} a las ${horaFormateada}`,
                        recipient: data.vocal,
                        metadata: {
                            mesaId: nuevaMesa.id,
                            materia: nuevaMesa.materia.nombre,
                            fecha: fechaFormateada,
                            hora: horaFormateada
                        }
                    };

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
                    console.error('Error al enviar notificaciones al vocal:', error);
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
                    modalidad: nuevaMesa.modalidad,
                    aula: nuevaMesa.aula,
                    webexLink: nuevaMesa.webexLink
                }
            };
        } catch (error) {
            console.error('Error en createMesa:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al crear la mesa'
            };
        }
    }

    async updateMesa(id: number, data: Partial<MesaData>): Promise<MesaResponse> {
        try {
            const mesaActualizada = await prisma.mesaDeExamen.update({
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
                    id: mesaActualizada.id,
                    profesor: mesaActualizada.profesorId,
                    vocal: mesaActualizada.vocalId,
                    carrera: mesaActualizada.carreraId,
                    materia: mesaActualizada.materiaId,
                    fecha: mesaActualizada.fecha,
                    descripcion: mesaActualizada.descripcion,
                    cargo: mesaActualizada.cargo,
                    verification: mesaActualizada.verification,
                    createdAt: mesaActualizada.createdAt,
                    modalidad: mesaActualizada.modalidad,
                    aula: mesaActualizada.aula,
                    webexLink: mesaActualizada.webexLink
                }
            };
        } catch (error) {
            console.error('Error en updateMesa:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al actualizar la mesa'
            };
        }
    }

    async deleteMesa(id: number): Promise<MesaDeExamen | null> {
        try {
            return await prisma.mesaDeExamen.delete({
                where: { id }
            });
        } catch (error) {
            console.error('Error en deleteMesa:', error);
            throw new Error('Error al eliminar la mesa');
        }
    }
}

export const mesaService = new MesaService(); 