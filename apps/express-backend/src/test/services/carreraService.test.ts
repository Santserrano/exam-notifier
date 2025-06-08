import { jest } from '@jest/globals';
import { CarreraService } from '../../../src/service/carreraService';
import { PrismaClient, Carrera } from '@prisma/client';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        carrera: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        }
    }))
}));

describe('CarreraService', () => {
    let carreraService: CarreraService;
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        carreraService = new CarreraService();
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        jest.clearAllMocks();
    });

    describe('getAllCarreras', () => {
        it('should return all carreras', async () => {
            const mockCarreras = [
                {
                    id: '1',
                    nombre: 'Carrera 1',
                    materias: [
                        {
                            id: '1',
                            nombre: 'Materia 1'
                        }
                    ]
                }
            ] as unknown as Carrera[];

            (mockPrisma.carrera.findMany as jest.Mock).mockResolvedValue(mockCarreras);

            const result = await carreraService.getAllCarreras();
            expect(result).toEqual(mockCarreras);
            expect(mockPrisma.carrera.findMany).toHaveBeenCalledWith({
                include: {
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when getting carreras fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.carrera.findMany as jest.Mock).mockRejectedValue(error);

            await expect(carreraService.getAllCarreras()).rejects.toThrow('Error al obtener las carreras');
        });
    });

    describe('getCarreraById', () => {
        it('should return carrera by id', async () => {
            const mockCarrera = {
                id: '1',
                nombre: 'Carrera 1',
                materias: [
                    {
                        id: '1',
                        nombre: 'Materia 1'
                    }
                ]
            } as unknown as Carrera;

            (mockPrisma.carrera.findUnique as jest.Mock).mockResolvedValue(mockCarrera);

            const result = await carreraService.getCarreraById('1');
            expect(result).toEqual(mockCarrera);
            expect(mockPrisma.carrera.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: {
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when getting carrera fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.carrera.findUnique as jest.Mock).mockRejectedValue(error);

            await expect(carreraService.getCarreraById('1')).rejects.toThrow('Error al obtener la carrera');
        });
    });

    describe('createCarrera', () => {
        it('should create a new carrera', async () => {
            const mockCarrera = {
                id: '1',
                nombre: 'Carrera 1',
                materias: []
            } as unknown as Carrera;

            (mockPrisma.carrera.create as jest.Mock).mockResolvedValue(mockCarrera);

            const result = await carreraService.createCarrera({
                nombre: 'Carrera 1'
            });
            expect(result).toEqual(mockCarrera);
            expect(mockPrisma.carrera.create).toHaveBeenCalledWith({
                data: {
                    nombre: 'Carrera 1'
                },
                include: {
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when creating carrera fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.carrera.create as jest.Mock).mockRejectedValue(error);

            await expect(carreraService.createCarrera({
                nombre: 'Carrera 1'
            })).rejects.toThrow('Error al crear la carrera');
        });
    });

    describe('updateCarrera', () => {
        it('should update a carrera', async () => {
            const mockCarrera = {
                id: '1',
                nombre: 'Carrera Actualizada',
                materias: []
            } as unknown as Carrera;

            (mockPrisma.carrera.update as jest.Mock).mockResolvedValue(mockCarrera);

            const result = await carreraService.updateCarrera('1', {
                nombre: 'Carrera Actualizada'
            });
            expect(result).toEqual(mockCarrera);
            expect(mockPrisma.carrera.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: {
                    nombre: 'Carrera Actualizada'
                },
                include: {
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when updating carrera fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.carrera.update as jest.Mock).mockRejectedValue(error);

            await expect(carreraService.updateCarrera('1', {
                nombre: 'Carrera Actualizada'
            })).rejects.toThrow('Error al actualizar la carrera');
        });
    });

    describe('deleteCarrera', () => {
        it('should delete a carrera', async () => {
            const mockCarrera = {
                id: '1',
                nombre: 'Carrera 1',
                materias: []
            } as unknown as Carrera;

            (mockPrisma.carrera.delete as jest.Mock).mockResolvedValue(mockCarrera);

            const result = await carreraService.deleteCarrera('1');
            expect(result).toEqual(mockCarrera);
            expect(mockPrisma.carrera.delete).toHaveBeenCalledWith({
                where: { id: '1' },
                include: {
                    materias: {
                        select: {
                            id: true,
                            nombre: true
                        }
                    }
                }
            });
        });

        it('should throw error when deleting carrera fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.carrera.delete as jest.Mock).mockRejectedValue(error);

            await expect(carreraService.deleteCarrera('1')).rejects.toThrow('Error al eliminar la carrera');
        });
    });
}); 