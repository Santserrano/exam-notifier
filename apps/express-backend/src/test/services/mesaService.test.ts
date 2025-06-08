import { jest } from '@jest/globals';
import { mesaService } from '../../../src/service/mesaService';
import { PrismaClient, Mesa } from '@prisma/client';
import { notificationFactory } from '../../../src/core/notifications/NotificationFactory';
import { notificacionService } from '../../../src/service/NotificationService';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        mesa: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        }
    }))
}));

// Mock de notificationFactory
jest.mock('../../../src/core/notifications/NotificationFactory', () => ({
    notificationFactory: {
        createNotification: jest.fn()
    }
}));

// Mock de notificacionService
jest.mock('../../../src/service/NotificationService', () => ({
    notificacionService: {
        getConfigByProfesor: jest.fn()
    }
}));

describe('MesaService', () => {
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        jest.clearAllMocks();
    });

    describe('getAllMesas', () => {
        it('should return all mesas', async () => {
            const mockMesas = [
                {
                    id: '1',
                    fecha: new Date(),
                    hora: '10:00',
                    materiaId: '1',
                    materia: {
                        id: '1',
                        nombre: 'Materia 1'
                    }
                }
            ] as unknown as Mesa[];

            (mockPrisma.mesa.findMany as jest.Mock).mockResolvedValue(mockMesas);

            const result = await mesaService.getAllMesas();
            expect(result).toEqual(mockMesas);
            expect(mockPrisma.mesa.findMany).toHaveBeenCalledWith({
                include: {
                    materia: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when getting mesas fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesa.findMany as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.getAllMesas()).rejects.toThrow('Error al obtener las mesas');
        });
    });

    describe('getMesaById', () => {
        it('should return mesa by id', async () => {
            const mockMesa = {
                id: '1',
                fecha: new Date(),
                hora: '10:00',
                materiaId: '1',
                materia: {
                    id: '1',
                    nombre: 'Materia 1'
                }
            } as unknown as Mesa;

            (mockPrisma.mesa.findUnique as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.getMesaById('1');
            expect(result).toEqual(mockMesa);
            expect(mockPrisma.mesa.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: {
                    materia: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when getting mesa fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesa.findUnique as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.getMesaById('1')).rejects.toThrow('Error al obtener la mesa');
        });
    });

    describe('createMesa', () => {
        it('should create a new mesa', async () => {
            const mockMesa = {
                id: '1',
                fecha: new Date(),
                hora: '10:00',
                materiaId: '1',
                materia: {
                    id: '1',
                    nombre: 'Materia 1'
                }
            } as unknown as Mesa;

            (mockPrisma.mesa.create as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.createMesa({
                fecha: new Date(),
                hora: '10:00',
                materiaId: '1'
            });
            expect(result).toEqual(mockMesa);
            expect(mockPrisma.mesa.create).toHaveBeenCalledWith({
                data: {
                    fecha: expect.any(Date),
                    hora: '10:00',
                    materiaId: '1'
                },
                include: {
                    materia: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when creating mesa fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesa.create as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.createMesa({
                fecha: new Date(),
                hora: '10:00',
                materiaId: '1'
            })).rejects.toThrow('Error al crear la mesa');
        });
    });

    describe('updateMesa', () => {
        it('should update a mesa', async () => {
            const mockMesa = {
                id: '1',
                fecha: new Date(),
                hora: '11:00',
                materiaId: '1',
                materia: {
                    id: '1',
                    nombre: 'Materia 1'
                }
            } as unknown as Mesa;

            (mockPrisma.mesa.update as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.updateMesa('1', {
                hora: '11:00'
            });
            expect(result).toEqual(mockMesa);
            expect(mockPrisma.mesa.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    hora: '11:00'
                },
                include: {
                    materia: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when updating mesa fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesa.update as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.updateMesa('1', {
                hora: '11:00'
            })).rejects.toThrow('Error al actualizar la mesa');
        });
    });

    describe('deleteMesa', () => {
        it('should delete a mesa', async () => {
            const mockMesa = {
                id: '1',
                fecha: new Date(),
                hora: '10:00',
                materiaId: '1',
                materia: {
                    id: '1',
                    nombre: 'Materia 1'
                }
            } as unknown as Mesa;

            (mockPrisma.mesa.delete as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.deleteMesa('1');
            expect(result).toEqual(mockMesa);
            expect(mockPrisma.mesa.delete).toHaveBeenCalledWith({
                where: { id: '1' },
                include: {
                    materia: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when deleting mesa fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesa.delete as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.deleteMesa('1')).rejects.toThrow('Error al eliminar la mesa');
        });
    });
}); 