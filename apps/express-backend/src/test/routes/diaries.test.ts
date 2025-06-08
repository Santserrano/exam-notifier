import request from 'supertest';
import { app } from '../../app'; // Tu app Express configurada
import { prisma } from '../../lib/prisma';
import { mesaService } from '../../service/mesaService';
import { ProfesorService } from '../../service/profesorService';

describe('Mesa Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Mock de middleware de autenticación
  app.use((req, res, next) => {
    req.user = { apiKey: 'valid-key' };
    next();
  });

  describe('GET /carreras', () => {
    it('debe retornar 200 con carreras', async () => {
      const mockCarreras = [{ id: 1, nombre: 'Ingeniería' }];
      (prisma.carrera.findMany as jest.Mock).mockResolvedValue(mockCarreras);

      const response = await request(app).get('/carreras');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCarreras);
    });

    it('debe manejar errores correctamente', async () => {
      (prisma.carrera.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));
      
      const response = await request(app).get('/carreras');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Error al obtener las carreras' });
    });
  });

  describe('POST /mesas', () => {
    const validPayload = {
      profesor: 'prof-1',
      vocal: 'vocal-1',
      carrera: 'carrera-1',
      materia: 'materia-1',
      fecha: '2025-06-10T12:00:00Z',
      modalidad: 'Presencial',
      aula: 'A101'
    };

    it('debe crear mesa exitosamente', async () => {
      const mockMesa = { id: 1, ...validPayload };
      (mesaService.createMesa as jest.Mock).mockResolvedValue(mockMesa);

      const response = await request(app)
        .post('/mesas')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockMesa);
    });

    it('debe validar campos requeridos', async () => {
      const response = await request(app)
        .post('/mesas')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Faltan datos requeridos');
    });

    it('debe validar formato de fecha', async () => {
      const response = await request(app)
        .post('/mesas')
        .send({ ...validPayload, fecha: 'fecha-invalida' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Formato de fecha inválido');
    });

    it('debe validar modalidad presencial', async () => {
      const response = await request(app)
        .post('/mesas')
        .send({ ...validPayload, modalidad: 'Presencial', aula: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('aula es requerido');
    });
  });

  describe('PUT /mesas/:id', () => {
    it('debe actualizar mesa correctamente', async () => {
      const updatedMesa = { id: 1, profesor: 'nuevo-prof' };
      (mesaService.updateMesa as jest.Mock).mockResolvedValue(updatedMesa);

      const response = await request(app)
        .put('/mesas/1')
        .send({ profesor: 'nuevo-prof' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedMesa);
    });

    it('debe manejar mesa no encontrada', async () => {
      (mesaService.updateMesa as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/mesas/999')
        .send({ profesor: 'nuevo-prof' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('no encontrada');
    });
  });

});