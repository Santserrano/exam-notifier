const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { mesaService } = require('../service/mesaService');
const { ProfesorService } = require('../service/profesorService');
const { validateApiKey } = require('../middleware/auth');

// Mockear las dependencias
jest.mock('../lib/prisma.js');
jest.mock('../service/mesaService.js');
jest.mock('../service/profesorService.js');
jest.mock('../middleware/auth.js');

// Importar el router después de mockear las dependencias
const router = require('./tuRouter');

// Configurar la app de Express para testing
const app = express();
app.use(express.json());
app.use(router);

// Mockear los servicios
const profesorService = new ProfesorService();
const prisma = new PrismaClient();

// Mockear el middleware de autenticación para que pase siempre en los tests
validateApiKey.mockImplementation((req, res, next) => next());

describe('API Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /carreras', () => {
    it('debe retornar todas las carreras con sus materias', async () => {
      const mockCarreras = [
        {
          id: '1',
          nombre: 'Ingeniería',
          materias: [{ id: '1', nombre: 'Matemática' }]
        }
      ];

      prisma.carrera.findMany.mockResolvedValue(mockCarreras);

      const res = await request(app).get('/carreras');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCarreras);
      expect(prisma.carrera.findMany).toHaveBeenCalledWith({
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

    it('debe manejar errores al obtener carreras', async () => {
      prisma.carrera.findMany.mockRejectedValue(new Error('DB Error'));

      const res = await request(app).get('/carreras');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Error al obtener las carreras' });
    });
  });

  describe('GET /profesores', () => {
    it('debe retornar todos los profesores', async () => {
      const mockProfesores = [{ id: '1', nombre: 'Profesor 1' }];
      profesorService.getAllProfesores.mockResolvedValue(mockProfesores);

      const res = await request(app).get('/profesores');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProfesores);
    });

    it('debe manejar errores al obtener profesores', async () => {
      profesorService.getAllProfesores.mockRejectedValue(new Error('Error'));

      const res = await request(app).get('/profesores');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Error al obtener los profesores' });
    });
  });

  describe('Mesa Endpoints', () => {
    describe('GET /mesas', () => {
      it('debe retornar todas las mesas', async () => {
        const mockMesas = [{ id: 1, profesor: 'Profesor 1' }];
        mesaService.getAllMesas.mockResolvedValue(mockMesas);

        const res = await request(app).get('/mesas');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockMesas);
      });

      it('debe manejar errores al obtener mesas', async () => {
        mesaService.getAllMesas.mockRejectedValue(new Error('Error'));

        const res = await request(app).get('/mesas');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Error al obtener las mesas' });
      });
    });

    describe('GET /mesas/:id', () => {
      it('debe retornar una mesa específica', async () => {
        const mockMesa = { id: 1, profesor: 'Profesor 1' };
        mesaService.getMesaById.mockResolvedValue(mockMesa);

        const res = await request(app).get('/mesas/1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockMesa);
      });

      it('debe retornar 404 si la mesa no existe', async () => {
        mesaService.getMesaById.mockResolvedValue(null);

        const res = await request(app).get('/mesas/999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Mesa no encontrada' });
      });

      it('debe manejar errores al obtener una mesa', async () => {
        mesaService.getMesaById.mockRejectedValue(new Error('Error'));

        const res = await request(app).get('/mesas/1');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Error al obtener la mesa' });
      });
    });

    describe('POST /mesas', () => {
      const validMesaData = {
        profesor: 'Profesor 1',
        vocal: 'Vocal 1',
        carrera: 'Carrera 1',
        materia: 'Materia 1',
        fecha: '2023-01-01T00:00:00.000Z',
        modalidad: 'Presencial',
        aula: 'Aula 1'
      };

      it('debe crear una nueva mesa con datos válidos', async () => {
        const mockMesa = { id: 1, ...validMesaData };
        mesaService.createMesa.mockResolvedValue(mockMesa);

        const res = await request(app)
          .post('/mesas')
          .send(validMesaData);

        expect(res.status).toBe(201);
        expect(res.body).toEqual(mockMesa);
      });

      it('debe validar campos requeridos', async () => {
        const res = await request(app)
          .post('/mesas')
          .send({});

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Faltan datos requeridos' });
      });

      it('debe validar formato de fecha inválido', async () => {
        const res = await request(app)
          .post('/mesas')
          .send({
            ...validMesaData,
            fecha: 'fecha-invalida'
          });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Formato de fecha inválido' });
      });

      it('debe validar modalidad inválida', async () => {
        const res = await request(app)
          .post('/mesas')
          .send({
            ...validMesaData,
            modalidad: 'Invalid'
          });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'Modalidad inválida' });
      });

      it('debe validar campos para modalidad presencial', async () => {
        const res = await request(app)
          .post('/mesas')
          .send({
            ...validMesaData,
            aula: undefined
          });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ 
          error: 'El campo aula es requerido para modalidad presencial' 
        });
      });

      it('debe validar campos para modalidad virtual', async () => {
        const res = await request(app)
          .post('/mesas')
          .send({
            ...validMesaData,
            modalidad: 'Virtual',
            webexLink: undefined
          });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ 
          error: 'El campo webexLink es requerido para modalidad virtual' 
        });
      });

      it('debe manejar errores al crear mesa', async () => {
        mesaService.createMesa.mockRejectedValue(new Error('Error'));

        const res = await request(app)
          .post('/mesas')
          .send(validMesaData);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Error al crear la mesa' });
      });
    });

    describe('PUT /mesas/:id', () => {
      it('debe actualizar una mesa existente', async () => {
        const updatedData = { profesor: 'Profesor Actualizado' };
        const mockMesa = { id: 1, ...updatedData };
        mesaService.updateMesa.mockResolvedValue(mockMesa);

        const res = await request(app)
          .put('/mesas/1')
          .send(updatedData);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockMesa);
      });

      it('debe retornar 404 si la mesa no existe', async () => {
        mesaService.updateMesa.mockResolvedValue(null);

        const res = await request(app)
          .put('/mesas/999')
          .send({ profesor: 'Profesor Actualizado' });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Mesa no encontrada' });
      });

      it('debe manejar errores al actualizar mesa', async () => {
        mesaService.updateMesa.mockRejectedValue(new Error('Error'));

        const res = await request(app)
          .put('/mesas/1')
          .send({ profesor: 'Profesor Actualizado' });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Error al actualizar la mesa' });
      });
    });

    describe('DELETE /mesas/:id', () => {
      it('debe eliminar una mesa existente', async () => {
        const mockMesa = { id: 1, profesor: 'Profesor 1' };
        mesaService.deleteMesa.mockResolvedValue(mockMesa);

        const res = await request(app).delete('/mesas/1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockMesa);
      });

      it('debe retornar 404 si la mesa no existe', async () => {
        mesaService.deleteMesa.mockResolvedValue(null);

        const res = await request(app).delete('/mesas/999');

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: 'Mesa no encontrada' });
      });

      it('debe manejar errores al eliminar mesa', async () => {
        mesaService.deleteMesa.mockRejectedValue(new Error('Error'));

        const res = await request(app).delete('/mesas/1');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Error al eliminar la mesa' });
      });
    });

    describe('GET /mesas/profesor/:profesorId', () => {
      it('debe retornar mesas de un profesor específico', async () => {
        const mockMesas = [{ id: 1, profesor: 'Profesor 1' }];
        mesaService.getMesasByProfesorId.mockResolvedValue(mockMesas);

        const res = await request(app).get('/mesas/profesor/1');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockMesas);
      });

      it('debe validar que el profesorId sea proporcionado', async () => {
        const res = await request(app).get('/mesas/profesor/');

        expect(res.status).toBe(404); // Express maneja esto como 404 por la ruta no encontrada
      });

      it('debe manejar errores al obtener mesas de profesor', async () => {
        mesaService.getMesasByProfesorId.mockRejectedValue(new Error('Error'));

        const res = await request(app).get('/mesas/profesor/1');

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: 'Error al obtener las mesas del profesor' });
      });
    });
  });

  describe('PUT /profesores/:profesorId/config', () => {
    const validConfigData = {
      carreras: ['1'],
      materias: ['1']
    };

    it('debe actualizar la configuración de un profesor', async () => {
      const mockProfesor = {
        id: '1',
        carreras: [{ id: '1', nombre: 'Carrera 1' }],
        materias: [{ id: '1', nombre: 'Materia 1' }]
      };

      prisma.profesor.update.mockResolvedValue(mockProfesor);
      prisma.profesor.findUnique.mockResolvedValue(mockProfesor);

      const res = await request(app)
        .put('/profesores/1/config')
        .send(validConfigData);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProfesor);
    });

    it('debe validar campos requeridos', async () => {
      const res = await request(app)
        .put('/profesores/1/config')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'Faltan datos requeridos' });
    });

    it('debe manejar errores al actualizar configuración', async () => {
      prisma.profesor.update.mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .put('/profesores/1/config')
        .send(validConfigData);

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error al actualizar la configuración');
    });
  });

  describe('Middleware de autenticación', () => {
    beforeEach(() => {
      // Restaurar el mock original para probar el middleware
      validateApiKey.mockRestore();
    });

    it('debe rechazar peticiones sin API key', async () => {
      validateApiKey.mockImplementation((req, res, next) => {
        return res.status(401).json({ error: 'API key no proporcionada' });
      });

      const res = await request(app).get('/carreras');

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'API key no proporcionada' });
    });

    it('debe rechazar peticiones con API key inválida', async () => {
      validateApiKey.mockImplementation((req, res, next) => {
        return res.status(403).json({ error: 'API key inválida' });
      });

      const res = await request(app)
        .get('/carreras')
        .set('x-api-key', 'invalid-key');

      expect(res.status).toBe(403);
      expect(res.body).toEqual({ error: 'API key inválida' });
    });
  });








  // Pruebas adicionales para POST /mesas
describe('POST /mesas - casos específicos', () => {
  it('debe manejar diferentes formatos de fecha válidos', async () => {
    const validFormats = [
      '2023-01-01',
      '2023-01-01T00:00:00',
      '2023-01-01T00:00:00.000Z',
      '01/01/2023'
    ];
    
    for (const format of validFormats) {
      const res = await request(app)
        .post('/mesas')
        .send({
          profesor: 'Profesor 1',
          vocal: 'Vocal 1',
          carrera: 'Carrera 1',
          materia: 'Materia 1',
          fecha: format,
          modalidad: 'Presencial',
          aula: 'Aula 1'
        });
      
      expect(res.status).toBe(201);
    }
  });

  it('debe establecer verification en false por defecto', async () => {
    const mesaData = {
      profesor: 'Profesor 1',
      vocal: 'Vocal 1',
      carrera: 'Carrera 1',
      materia: 'Materia 1',
      fecha: '2023-01-01',
      modalidad: 'Presencial',
      aula: 'Aula 1'
    };

    mesaService.createMesa.mockImplementation((data) => {
      expect(data.verification).toBe(false);
      return Promise.resolve({ id: 1, ...data });
    });

    const res = await request(app)
      .post('/mesas')
      .send(mesaData);

    expect(res.status).toBe(201);
  });
});
});