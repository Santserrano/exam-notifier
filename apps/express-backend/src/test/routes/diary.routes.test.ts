import request from 'supertest';
import express from 'express';
import diaryRouter from '../../routes/diary.routes.js';

// Mock de los controladores
jest.mock('../controllers/diary.controller.js', () => ({
  getAceptacionesProfesor: jest.fn(),
  getAceptaciones: jest.fn(),
  crearAceptacionMesa: jest.fn(),
}));

import {
  getAceptacionesProfesor,
  getAceptaciones,
  crearAceptacionMesa,
} from '../../controllers/diary.controller.js';

const app = express();
app.use(express.json());
app.use(diaryRouter);

describe('Diary Router Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests para GET /mesas/aceptaciones/profesor/:profesorId
  describe('GET /mesas/aceptaciones/profesor/:profesorId', () => {
    it('debe obtener aceptaciones de profesor exitosamente', async () => {
      const mockAceptaciones = [
        { id: 1, profesorId: 'prof1', mesaId: 1 },
        { id: 2, profesorId: 'prof1', mesaId: 2 }
      ];
      
      (getAceptacionesProfesor as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockAceptaciones);
      });

      const response = await request(app).get('/mesas/aceptaciones/profesor/prof1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAceptaciones);
      expect(getAceptacionesProfesor).toHaveBeenCalled();
    });

    it('debe manejar errores correctamente', async () => {
      (getAceptacionesProfesor as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error del servidor' });
      });

      const response = await request(app).get('/mesas/aceptaciones/profesor/prof1');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error del servidor' });
    });
  });

  // Tests para GET /mesas/aceptaciones
  describe('GET /mesas/aceptaciones', () => {
    it('debe obtener todas las aceptaciones exitosamente', async () => {
      const mockAceptaciones = [
        { id: 1, profesorId: 'prof1', mesaId: 1 },
        { id: 2, profesorId: 'prof2', mesaId: 2 }
      ];
      
      (getAceptaciones as jest.Mock).mockImplementation((req, res) => {
        res.status(200).json(mockAceptaciones);
      });

      const response = await request(app).get('/mesas/aceptaciones');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAceptaciones);
      expect(getAceptaciones).toHaveBeenCalled();
    });

    it('debe manejar errores al obtener aceptaciones', async () => {
      (getAceptaciones as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error al obtener aceptaciones' });
      });

      const response = await request(app).get('/mesas/aceptaciones');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error al obtener aceptaciones' });
    });
  });

  // Tests para POST /mesas/:mesaId/aceptacion
  describe('POST /mesas/:mesaId/aceptacion', () => {
    const validPayload = {
      profesorId: 'prof123',
      cargo: 'Titular',
      fechaAceptacion: '2023-06-15T12:00:00Z'
    };

    it('debe crear aceptación exitosamente', async () => {
      const mockAceptacion = {
        id: 1,
        mesaId: 1,
        ...validPayload
      };
      
      (crearAceptacionMesa as jest.Mock).mockImplementation((req, res) => {
        res.status(201).json(mockAceptacion);
      });

      const response = await request(app)
        .post('/mesas/1/aceptacion')
        .send(validPayload);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockAceptacion);
      expect(crearAceptacionMesa).toHaveBeenCalled();
    });

    it('debe validar parámetros requeridos', async () => {
      (crearAceptacionMesa as jest.Mock).mockImplementation((req, res) => {
        res.status(400).json({ error: 'ProfesorId es requerido' });
      });

      const response = await request(app)
        .post('/mesas/1/aceptacion')
        .send({ cargo: 'Titular' });
      
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'ProfesorId es requerido' });
    });

    it('debe manejar mesa no encontrada', async () => {
      (crearAceptacionMesa as jest.Mock).mockImplementation((req, res) => {
        res.status(404).json({ error: 'Mesa no encontrada' });
      });

      const response = await request(app)
        .post('/mesas/999/aceptacion')
        .send(validPayload);
      
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Mesa no encontrada' });
    });

    it('debe manejar errores internos', async () => {
      (crearAceptacionMesa as jest.Mock).mockImplementation((req, res) => {
        res.status(500).json({ error: 'Error al crear aceptación' });
      });

      const response = await request(app)
        .post('/mesas/1/aceptacion')
        .send(validPayload);
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error al crear aceptación' });
    });
  });
});