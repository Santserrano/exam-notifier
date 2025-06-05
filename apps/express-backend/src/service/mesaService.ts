import { MesaDeExamen, PrismaClient } from '@prisma/client';

import { MesaAdapter } from '../Adapters/MasaAdapter.js';
import { notificationFactory } from '../core/notifications/NotificationFactory.js';
import { MesaData, MesaResponse } from '../interfaces/interface.js';
import { notificacionService } from './NotificationService.js';

interface NotificationMetadata {
    mesaId: number;
    materia: string;
    fecha: string;
    hora: string;
}

class MesaService {
    private prisma: PrismaClient;
    private adapter: MesaAdapter;

    constructor(prisma = new PrismaClient(), adapter = new MesaAdapter()) {
        this.prisma =  prisma;
        this.adapter = adapter;
    }

    private async sendNotification(
        profesorId: string,
        title: string,
        body: string,
        metadata: NotificationMetadata,
    ) {
        try {
            const profesor = await this.prisma.profesor.findUnique({ 
                where: { id: profesorId } 
            });
            
            if (!profesor) return;
            
            const config = await notificacionService.getConfigByProfesor(profesorId);
            if (!config) return;
            
            const notificationData = {
                title,
                body,
                recipient: profesorId,
                metadata
            };

            if (config.webPushEnabled) {
                const pushNotification = notificationFactory.createNotification('push', notificationData);
                await pushNotification.send();
            }

            if (profesor.email && config.emailEnabled) {
                const emailNotification = notificationFactory.createNotification('email', {
                    ...notificationData,
                    recipient: profesor.email
                });
                await emailNotification.send();
            }

            if (profesor.telefono && config.smsEnabled) {
                const whatsappNotification = notificationFactory.createNotification('whatsapp', {
                    ...notificationData,
                    recipient: profesor.telefono
                });
                await whatsappNotification.send();
            }
        } catch (error) {
            console.error(`Error sending notification to professor ${profesorId}:`, error);
        }
    }

    private formatMesaDate(fecha: Date) {
        const fechaObj = new Date(fecha);
        return {
            fechaFormateada: fechaObj.toLocaleDateString(),
            horaFormateada: fechaObj.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
    }

    async getAllMesas(): Promise<MesaDeExamen[]> {
        try {
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
            return mesas;
        } catch (error) {
            throw new Error('Error al obtener las mesas');
        }
    }

    async getMesasByProfesorId(profesorId: string): Promise<MesaResponse> {
        try {
            const mesas = await this.prisma.mesaDeExamen.findMany({
                where: { 
                    OR: [
                        { profesorId: profesorId },
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
            return { 
                success: true, 
                data: mesas.map(m => this.adapter.adapt(m)) 
            };
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener las mesas del profesor'
            };
        }
    }

    async getMesaById(id: number): Promise<MesaResponse> {
        try {
            const mesa = await this.prisma.mesaDeExamen.findUnique({
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

            if (!mesa) {
                return {
                    success: false,
                    error: 'Mesa no encontrada'
                };
            }

            return {
                success: true,
                data: this.adapter.adapt(mesa)
            };
        } catch (error) {
            return {
                success: false,
                error: 'Error al obtener la mesa'
            };
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

            // Obtener datos del profesor y vocal
            const [profesorData, vocalData] = await Promise.all([
                this.prisma.profesor.findUnique({ where: { id: data.profesor } }),
                this.prisma.profesor.findUnique({ where: { id: data.vocal } })
            ]);

            if (!profesorData || !vocalData) {
                throw new Error('Profesor o vocal no encontrado');
            }

            // Preparar datos de notificación
            const { fechaFormateada, horaFormateada } = this.formatMesaDate(data.fecha);
            const metadata = {
                mesaId: nuevaMesa.id,
                materia: nuevaMesa.materia.nombre,
                fecha: fechaFormateada,
                hora: horaFormateada
            };

            // Enviar notificaciones en paralelo (no bloqueantes)
            Promise.all([
                this.sendNotification(
                    data.profesor,
                    'Nueva mesa asignada',
                    `Hola ${profesorData.nombre}, se te ha asignado una nueva mesa: ${nuevaMesa.materia.nombre} el ${fechaFormateada} a las ${horaFormateada}`,
                    metadata
                ),
                this.sendNotification(
                    data.vocal,
                    'Nueva mesa asignada',
                    `Hola ${vocalData.nombre}, se te ha asignado como vocal en una mesa de ${nuevaMesa.materia.nombre} (${nuevaMesa.carrera.nombre}) para el ${fechaFormateada} a las ${horaFormateada}`,
                    metadata
                )
            ]);

            return { 
                success: true, 
                data: this.adapter.adapt(nuevaMesa)
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al crear la mesa'
            };
        }
    }

    async updateMesa(id: number, data: Partial<MesaData>): Promise<MesaResponse> {
        try {
            const mesaActualizada = await this.prisma.mesaDeExamen.update({
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
                data: this.adapter.adapt(mesaActualizada)
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al actualizar la mesa'
            };
        }
    }

    async deleteMesa(id: number): Promise<MesaResponse> {
        try {
            const mesa = await this.prisma.mesaDeExamen.delete({
                where: { id }
            });

            return {
                success: true,
                data: this.adapter.adapt(mesa)
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Error al eliminar la mesa'
            };
        }
    }
}

export const mesaService = new MesaService(); 