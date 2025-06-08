import request from 'supertest';
import express from 'express';
import router from '../../routes/notifications'; // Ajusta al path correcto
import { prisma } from '../../lib/prisma';
const { validateApiKey } = require('../middleware/auth');

jest.mock('../lib/prisma');
jest.mock('../middleware/auth', () => ({
  validateApiKey: (_req, _res, next) => next()
}));

const app = express();
app.use(express.json());
app.use(router);

describe('Rutas del sistema de mesas', () => {
  describe('GET /carreras', () => {
    it('debe devolver una lista de carreras con sus materias', async () => {
      const mockCarreras = [
        {
          id: 'c1',
          nombre: 'Ingeniería en Sistemas',
          materias: [{ id: 'm1', nombre: 'Algoritmos' }]
        }
      ];
      (prisma.carrera.findMany as jest.Mock).mockResolvedValue(mockCarreras);

      const res = await request(app)
        .get('/carreras')
        .set('x-api-key', 'test-api-key'); // si tu middleware depende de esto

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCarreras);
    });

    it('debe manejar errores y devolver 500', async () => {
      (prisma.carrera.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'));

      const res = await request(app)
        .get('/carreras')
        .set('x-api-key', 'test-api-key');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Error al obtener las carreras' });
    });
  });

  // Puedes agregar tests similares para:
  // - GET /profesores (mockeando profesorService)
  // - GET /mesas
  // - POST /mesas
  // - PUT /mesas/:id
  // - DELETE /mesas/:id
});
