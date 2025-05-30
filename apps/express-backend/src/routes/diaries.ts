import { PrismaClient } from '@prisma/client'
import express from 'express'

import { mesaService } from '../service/mesaService.js'
import { ProfesorService } from '../service/profesorService.js'

const router = express.Router()
const prisma = new PrismaClient()

const profesorService = new ProfesorService()

// Middleware para validar API key
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: 'API key inválida' });
  }

  return next();
};

// Aplicar middleware a todas las rutas
router.use(validateApiKey);

// Obtener todas las carreras
router.get('/carreras', async (req, res) => {
  try {
    const carreras = await prisma.carrera.findMany({
      include: {
        materias: {
          select: {
            id: true,
            nombre: true
          }
        }
      }
    });
    res.json(carreras);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las carreras' });
  }
});

// Obtener todos los profesores
router.get('/profesores', async (req, res) => {
  try {
    const profesores = await profesorService.getAllProfesores();
    res.json(profesores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los profesores' });
  }
});

// Obtener todas las mesas
router.get('/mesas', async (req, res) => {
  try {
    const mesas = await mesaService.getAllMesas();
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las mesas' });
  }
});

// Obtener una mesa por ID
router.get('/mesas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const mesa = await mesaService.getMesaById(id)

    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' })
    }
    return res.json(mesa)
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener la mesa' })
  }
})

// Crear una nueva mesa
router.post('/mesas', async (req, res) => {
  try {
    const mesaData = req.body;
    // Validar datos requeridos
    const camposRequeridos = ['profesor', 'vocal', 'carrera', 'materia', 'fecha', 'modalidad'];
    const camposFaltantes = camposRequeridos.filter(campo => !mesaData[campo]);

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        error: 'Campos requeridos faltantes'
      });
    }

    // Validar formato de fecha
    if (isNaN(new Date(mesaData.fecha).getTime())) {
      return res.status(400).json({
        error: 'Formato de fecha inválido'
      });
    }

    // Validar que la materia existe
    const materia = await prisma.materia.findUnique({
      where: { id: mesaData.materia }
    });

    if (!materia) {
      return res.status(400).json({
        error: 'Materia no encontrada'
      });
    }

    // Validar que los profesores existen
    const [profesor, vocal] = await Promise.all([
      prisma.profesor.findUnique({ where: { id: mesaData.profesor } }),
      prisma.profesor.findUnique({ where: { id: mesaData.vocal } })
    ]);

    if (!profesor || !vocal) {
      return res.status(400).json({
        error: 'Uno o ambos profesores no existen'
      });
    }

    const nuevaMesa = await mesaService.createMesa(mesaData);
    return res.status(201).json(nuevaMesa);
  } catch (error) {
    return res.status(500).json({
      error: 'Error al crear la mesa'
    });
  }
});

// Actualizar una mesa
router.put('/mesas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const mesaData = req.body

    const mesaActualizada = await mesaService.updateMesa(id, mesaData)
    if (!mesaActualizada) {
      return res.status(404).json({ error: 'Mesa no encontrada' })
    }
    return res.json(mesaActualizada)
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar la mesa' })
  }
})

// Eliminar una mesa
router.delete('/mesas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const mesa = await mesaService.deleteMesa(id)
    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' })
    }
    return res.json(mesa)
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar la mesa' })
  }
})

// Obtener mesas de un profesor específico
router.get('/mesas/profesor/:profesorId', async (req, res) => {
  try {
    const { profesorId } = req.params;
    const mesas = await mesaService.getMesasByProfesorId(profesorId);
    res.json(mesas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las mesas del profesor' });
  }
});

// Actualizar configuración de profesor
router.put('/profesores/:profesorId/config', async (req, res) => {
  try {
    const { profesorId } = req.params;
    const { carreras, materias } = req.body;

    if (!Array.isArray(carreras) || !Array.isArray(materias)) {
      return res.status(400).json({ error: 'Las carreras y materias deben ser arrays' });
    }

    // Verificar que el profesor existe
    const profesor = await prisma.profesor.findUnique({
      where: { id: profesorId }
    });

    if (!profesor) {
      return res.status(404).json({ error: 'Profesor no encontrado' });
    }

    // Verificar que todas las carreras existen
    const carrerasExistentes = await prisma.carrera.findMany({
      where: {
        id: {
          in: carreras
        }
      }
    });

    if (carrerasExistentes.length !== carreras.length) {
      return res.status(400).json({ error: 'Una o más carreras no existen' });
    }

    // Verificar que todas las materias existen y pertenecen a las carreras seleccionadas
    const materiasExistentes = await prisma.materia.findMany({
      where: {
        id: {
          in: materias
        },
        carreraId: {
          in: carreras
        }
      }
    });

    if (materiasExistentes.length !== materias.length) {
      return res.status(400).json({ error: 'Una o más materias no existen o no pertenecen a las carreras seleccionadas' });
    }

    // Actualizar las carreras y materias del profesor
    const updatedProfesor = await prisma.profesor.update({
      where: { id: profesorId },
      data: {
        carreras: {
          set: carreras.map((id: string) => ({ id }))
        },
        materias: {
          set: materias.map((id: string) => ({ id }))
        }
      },
      include: {
        carreras: true,
        materias: true
      }
    });

    return res.json({
      message: 'Configuración actualizada exitosamente',
      profesor: updatedProfesor
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

export default router
