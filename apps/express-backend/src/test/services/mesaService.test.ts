import { jest } from '@jest/globals';
import { MesaService } from '../../../src/service/mesaService';
import { PrismaClient, MesaDeExamen } from '@prisma/client';
import { notificationFactory } from '../../../src/core/notifications/NotificationFactory';
import { notificacionService } from '../../../src/service/NotificationService';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        mesaDeExamen: {
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
    let mesaService: MesaService;
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        mesaService = new MesaService();
        jest.clearAllMocks();
    });

    describe('getAllMesas', () => {
        it('should return all mesas', async () => {
            const mockMesas = [
                {
                    id: 1,
                    nombre: 'Mesa 1',
                    fecha: new Date('2025-06-08T01:07:25.735Z'),
                    hora: '10:00',
                    lugar: 'Aula 1',
                    materiaId: '1',
                    createdAt: new Date('2025-06-08T01:07:25.735Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.735Z')
                }
            ] as unknown as MesaDeExamen[];

            (mockPrisma.mesaDeExamen.findMany as jest.Mock).mockResolvedValue(mockMesas);

            const result = await mesaService.getAllMesas();
            expect(result).toEqual(mockMesas);
            expect(mockPrisma.mesaDeExamen.findMany).toHaveBeenCalled();
        });

        it('should throw error when getting mesas fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesaDeExamen.findMany as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.getAllMesas()).rejects.toThrow('Error al obtener las mesas');
        });
    });

    describe('getMesaById', () => {
        it('should return mesa by id', async () => {
            const mockMesa = {
                id: 1,
                nombre: 'Mesa 1',
                fecha: new Date('2025-06-08T01:07:25.764Z'),
                hora: '10:00',
                lugar: 'Aula 1',
                materiaId: '1',
                createdAt: new Date('2025-06-08T01:07:25.764Z'),
                updatedAt: new Date('2025-06-08T01:07:25.764Z')
            } as unknown as MesaDeExamen;

            (mockPrisma.mesaDeExamen.findUnique as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.getMesaById(1);
            expect(result).toEqual(mockMesa);
            expect(mockPrisma.mesaDeExamen.findUnique).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        it('should throw error when getting mesa fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesaDeExamen.findUnique as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.getMesaById(1)).rejects.toThrow('Error al obtener la mesa');
        });
    });

    describe('getMesasByMateria', () => {
        it('should return mesas by materia', async () => {
            const mockMesas = [
                {
                    id: 1,
                    nombre: 'Mesa 1',
                    fecha: new Date('2025-06-08T01:07:25.768Z'),
                    hora: '10:00',
                    lugar: 'Aula 1',
                    materiaId: '1',
                    createdAt: new Date('2025-06-08T01:07:25.768Z'),
                    updatedAt: new Date('2025-06-08T01:07:25.768Z')
                }
            ] as unknown as MesaDeExamen[];

            (mockPrisma.mesaDeExamen.findMany as jest.Mock).mockResolvedValue(mockMesas);

            const result = await mesaService.getMesasByMateria('1');
            expect(result).toEqual(mockMesas);
            expect(mockPrisma.mesaDeExamen.findMany).toHaveBeenCalledWith({
                where: { materiaId: '1' }
            });
        });

        it('should throw error when getting mesas by materia fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesaDeExamen.findMany as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.getMesasByMateria('1')).rejects.toThrow('Error al obtener las mesas por materia');
        });
    });

    describe('createMesa', () => {
        it('should create a new mesa', async () => {
            const mockMesa = {
                id: 1,
                nombre: 'Mesa 1',
                fecha: new Date('2025-06-08T01:07:25.772Z'),
                hora: '10:00',
                lugar: 'Aula 1',
                materiaId: '1',
                createdAt: new Date('2025-06-08T01:07:25.772Z'),
                updatedAt: new Date('2025-06-08T01:07:25.772Z')
            } as unknown as MesaDeExamen;

            (mockPrisma.mesaDeExamen.create as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.createMesa({
                nombre: 'Mesa 1',
                fecha: new Date('2025-06-08T01:07:25.772Z'),
                hora: '10:00',
                lugar: 'Aula 1',
                materiaId: '1'
            });
            expect(result).toEqual(mockMesa);
            expect(mockPrisma.mesaDeExamen.create).toHaveBeenCalledWith({
                data: {
                    nombre: 'Mesa 1',
                    fecha: new Date('2025-06-08T01:07:25.772Z'),
                    hora: '10:00',
                    lugar: 'Aula 1',
                    materiaId: '1'
                }
            });
        });

        it('should throw error when creating mesa fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesaDeExamen.create as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.createMesa({
                nombre: 'Mesa 1',
                fecha: new Date('2025-06-08T01:07:25.772Z'),
                hora: '10:00',
                lugar: 'Aula 1',
                materiaId: '1'
            })).rejects.toThrow('Error al crear la mesa');
        });
    });

    describe('updateMesa', () => {
        it('should update a mesa', async () => {
            const mockMesa = {
                id: 1,
                nombre: 'Mesa 1 Actualizada',
                fecha: new Date('2025-06-08T01:07:25.776Z'),
                hora: '11:00',
                lugar: 'Aula 2',
                materiaId: '1',
                createdAt: new Date('2025-06-08T01:07:25.776Z'),
                updatedAt: new Date('2025-06-08T01:07:25.776Z')
            } as unknown as MesaDeExamen;

            (mockPrisma.mesaDeExamen.update as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.updateMesa(1, {
                nombre: 'Mesa 1 Actualizada',
                fecha: new Date('2025-06-08T01:07:25.776Z'),
                hora: '11:00',
                lugar: 'Aula 2',
                materiaId: '1'
            });
            expect(result).toEqual(mockMesa);
            expect(mockPrisma.mesaDeExamen.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    nombre: 'Mesa 1 Actualizada',
                    fecha: new Date('2025-06-08T01:07:25.776Z'),
                    hora: '11:00',
                    lugar: 'Aula 2',
                    materiaId: '1'
                }
            });
        });

        it('should throw error when updating mesa fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesaDeExamen.update as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.updateMesa(1, {
                nombre: 'Mesa 1 Actualizada',
                fecha: new Date('2025-06-08T01:07:25.776Z'),
                hora: '11:00',
                lugar: 'Aula 2',
                materiaId: '1'
            })).rejects.toThrow('Error al actualizar la mesa');
        });
    });

    describe('deleteMesa', () => {
        it('should delete a mesa', async () => {
            const mockMesa = {
                id: 1,
                nombre: 'Mesa 1',
                fecha: new Date('2025-06-08T01:07:25.780Z'),
                hora: '10:00',
                lugar: 'Aula 1',
                materiaId: '1',
                createdAt: new Date('2025-06-08T01:07:25.780Z'),
                updatedAt: new Date('2025-06-08T01:07:25.780Z')
            } as unknown as MesaDeExamen;

            (mockPrisma.mesaDeExamen.delete as jest.Mock).mockResolvedValue(mockMesa);

            const result = await mesaService.deleteMesa(1);
            expect(result).toEqual(mockMesa);
            expect(mockPrisma.mesaDeExamen.delete).toHaveBeenCalledWith({
                where: { id: 1 }
            });
        });

        it('should throw error when deleting mesa fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.mesaDeExamen.delete as jest.Mock).mockRejectedValue(error);

            await expect(mesaService.deleteMesa(1)).rejects.toThrow('Error al eliminar la mesa');
        });
    });
}); 