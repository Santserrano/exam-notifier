import { jest } from '@jest/globals';
import { MateriaService } from '../../../src/service/materiaService';
import { PrismaClient } from '@prisma/client';

// Mock de PrismaClient
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        materia: {
            findMany: jest.fn(),
            findUnique: jest.fn()
        }
    }))
}));

describe('MateriaService', () => {
    let materiaService: MateriaService;
    let mockPrisma: jest.Mocked<PrismaClient>;

    beforeEach(() => {
        materiaService = new MateriaService();
        mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
        jest.clearAllMocks();
    });

    describe('getAllMaterias', () => {
        it('should return all materias with their carreras', async () => {
            const mockMaterias = [
                {
                    id: '1',
                    nombre: 'Materia 1',
                    carreraId: '1',
                    carrera: {
                        id: '1',
                        nombre: 'Carrera 1'
                    }
                }
            ];

            (mockPrisma.materia.findMany as jest.Mock).mockResolvedValue(mockMaterias);

            const result = await materiaService.getAllMaterias();
            expect(result).toEqual(mockMaterias);
            expect(mockPrisma.materia.findMany).toHaveBeenCalledWith({
                include: {
                    carrera: true
                }
            });
        });

        it('should throw error when getting materias fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.materia.findMany as jest.Mock).mockRejectedValue(error);

            await expect(materiaService.getAllMaterias()).rejects.toThrow(error);
        });
    });

    describe('getMateriaById', () => {
        it('should return materia by id with its carrera', async () => {
            const mockMateria = {
                id: '1',
                nombre: 'Materia 1',
                carreraId: '1',
                carrera: {
                    id: '1',
                    nombre: 'Carrera 1'
                }
            };

            (mockPrisma.materia.findUnique as jest.Mock).mockResolvedValue(mockMateria);

            const result = await materiaService.getMateriaById('1');
            expect(result).toEqual(mockMateria);
            expect(mockPrisma.materia.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                include: {
                    carrera: true
                }
            });
        });

        it('should return null when materia is not found', async () => {
            (mockPrisma.materia.findUnique as jest.Mock).mockResolvedValue(null);

            const result = await materiaService.getMateriaById('999');
            expect(result).toBeNull();
        });

        it('should throw error when getting materia fails', async () => {
            const error = new Error('Database error');
            (mockPrisma.materia.findUnique as jest.Mock).mockRejectedValue(error);

            await expect(materiaService.getMateriaById('1')).rejects.toThrow(error);
        });
    });
}); 