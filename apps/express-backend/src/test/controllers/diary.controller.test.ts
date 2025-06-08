import { jest } from '@jest/globals';
import { MesaAceptacion, MesaDeExamen, PrismaClient, Profesor } from '@prisma/client';
import { Request, Response } from 'express';

import { crearAceptacionMesa,getAceptaciones, getAceptacionesProfesor } from '../../../src/controllers/diary.controller';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        mesaAceptacion: {
            findMany: jest.fn(),
            upsert: jest.fn()
        },
        mesaDeExamen: {
            findUnique: jest.fn()
        },
        profesor: {
            findUnique: jest.fn()
        }
    }))
}));

// Mock del módulo prisma
jest.mock('../../../src/lib/prisma', () => ({
    prisma: new PrismaClient()
}));

describe('Diary Controller', () => {
    let mockPrisma: jest.Mocked<PrismaClient>;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockJson: jest.Mock;
    let mockStatus: jest.Mock;

    beforeEach(() => {
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockResponse = {
            json: mockJson,
            status: mockStatus
        } as unknown as Response;
        jest.clearAllMocks();
    });

    describe('getAceptacionesProfesor', () => {
        it('should return aceptaciones for a specific profesor', async () => {
            const mockAceptaciones = [
                {
                    id: '1',
                    mesaId: 1,
                    profesorId: '1',
                    estado: 'ACEPTADA',
                    mesa: { id: 1, nombre: 'Mesa 1' },
                    profesor: { id: '1', nombre: 'Profesor 1' }
                }
            ] as unknown as MesaAceptacion[];

            mockRequest = {
                params: { profesorId: '1' }
            };

            (mockPrisma.mesaAceptacion.findMany as jest.Mock).mockResolvedValue(mockAceptaciones);

            await getAceptacionesProfesor(mockRequest as Request, mockResponse as Response);

            expect(mockPrisma.mesaAceptacion.findMany).toHaveBeenCalledWith({
                where: { profesorId: '1' },
                include: {
                    mesa: true,
                    profesor: true
                }
            });
            expect(mockJson).toHaveBeenCalledWith(mockAceptaciones);
        });

        it('should return 400 if profesorId is missing', async () => {
            mockRequest = {
                params: {}
            };

            await getAceptacionesProfesor(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'ID del profesor es requerido' });
        });

        it('should handle errors', async () => {
            mockRequest = {
                params: { profesorId: '1' }
            };

            (mockPrisma.mesaAceptacion.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getAceptacionesProfesor(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Error al obtener aceptaciones' });
        });
    });

    describe('getAceptaciones', () => {
        it('should return all aceptaciones', async () => {
            const mockAceptaciones = [
                {
                    id: '1',
                    mesaId: 1,
                    profesorId: '1',
                    estado: 'ACEPTADA',
                    mesa: { id: 1, nombre: 'Mesa 1' },
                    profesor: { id: '1', nombre: 'Profesor 1' }
                }
            ] as unknown as MesaAceptacion[];

            (mockPrisma.mesaAceptacion.findMany as jest.Mock).mockResolvedValue(mockAceptaciones);

            await getAceptaciones(mockRequest as Request, mockResponse as Response);

            expect(mockPrisma.mesaAceptacion.findMany).toHaveBeenCalledWith({
                include: {
                    mesa: true,
                    profesor: true
                }
            });
            expect(mockJson).toHaveBeenCalledWith(mockAceptaciones);
        });

        it('should handle errors', async () => {
            (mockPrisma.mesaAceptacion.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getAceptaciones(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Error al obtener aceptaciones' });
        });
    });

    describe('crearAceptacionMesa', () => {
        it('should create a new aceptacion', async () => {
            const mockAceptacion = {
                id: '1',
                mesaId: 1,
                profesorId: '1',
                estado: 'ACEPTADA',
                mesa: { id: 1, nombre: 'Mesa 1' },
                profesor: { id: '1', nombre: 'Profesor 1' }
            } as unknown as MesaAceptacion;

            mockRequest = {
                body: {
                    mesaId: '1',
                    profesorId: '1',
                    estado: 'ACEPTADA'
                }
            };

            const mockMesa = { id: 1 } as unknown as MesaDeExamen;
            const mockProfesor = { id: '1' } as unknown as Profesor;

            (mockPrisma.mesaDeExamen.findUnique as jest.Mock).mockResolvedValue(mockMesa);
            (mockPrisma.profesor.findUnique as jest.Mock).mockResolvedValue(mockProfesor);
            (mockPrisma.mesaAceptacion.upsert as jest.Mock).mockResolvedValue(mockAceptacion);

            await crearAceptacionMesa(mockRequest as Request, mockResponse as Response);

            expect(mockPrisma.mesaAceptacion.upsert).toHaveBeenCalledWith({
                where: {
                    mesaId_profesorId: {
                        mesaId: 1,
                        profesorId: '1'
                    }
                },
                update: {
                    estado: 'ACEPTADA'
                },
                create: {
                    mesaId: 1,
                    profesorId: '1',
                    estado: 'ACEPTADA'
                },
                include: {
                    mesa: true,
                    profesor: true
                }
            });
            expect(mockJson).toHaveBeenCalledWith(mockAceptacion);
        });

        it('should return 400 if required parameters are missing', async () => {
            mockRequest = {
                body: {}
            };

            await crearAceptacionMesa(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Faltan parámetros requeridos' });
        });

        it('should return 400 if estado is invalid', async () => {
            mockRequest = {
                body: {
                    mesaId: '1',
                    profesorId: '1',
                    estado: 'INVALIDO'
                }
            };

            await crearAceptacionMesa(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Estado de aceptación inválido' });
        });

        it('should return 404 if mesa is not found', async () => {
            mockRequest = {
                body: {
                    mesaId: '1',
                    profesorId: '1',
                    estado: 'ACEPTADA'
                }
            };

            (mockPrisma.mesaDeExamen.findUnique as jest.Mock).mockResolvedValue(null);

            await crearAceptacionMesa(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Mesa no encontrada' });
        });

        it('should return 404 if profesor is not found', async () => {
            mockRequest = {
                body: {
                    mesaId: '1',
                    profesorId: '1',
                    estado: 'ACEPTADA'
                }
            };

            const mockMesa = { id: 1 } as unknown as MesaDeExamen;

            (mockPrisma.mesaDeExamen.findUnique as jest.Mock).mockResolvedValue(mockMesa);
            (mockPrisma.profesor.findUnique as jest.Mock).mockResolvedValue(null);

            await crearAceptacionMesa(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Profesor no encontrado' });
        });

        it('should handle errors', async () => {
            mockRequest = {
                body: {
                    mesaId: '1',
                    profesorId: '1',
                    estado: 'ACEPTADA'
                }
            };

            const mockMesa = { id: 1 } as unknown as MesaDeExamen;
            const mockProfesor = { id: '1' } as unknown as Profesor;

            (mockPrisma.mesaDeExamen.findUnique as jest.Mock).mockResolvedValue(mockMesa);
            (mockPrisma.profesor.findUnique as jest.Mock).mockResolvedValue(mockProfesor);
            (mockPrisma.mesaAceptacion.upsert as jest.Mock).mockRejectedValue(new Error('Database error'));

            await crearAceptacionMesa(mockRequest as Request, mockResponse as Response);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Error al crear/actualizar aceptación',
                details: 'Database error'
            });
        });
    });
}); 