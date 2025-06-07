import { Router } from 'express'

import { prisma } from '../lib/prisma.js'
import { validateApiKey } from '../middleware/auth.js'
import { mesaService } from '../service/mesaService.js'
import { ProfesorService } from '../service/profesorService.js'

const router = Router()
const profesorService = new ProfesorService()

// Middleware para validar API key
router.use(validateApiKey);

// Obtener todas las carreras
router.get('/carreras', async (_req, res) => {
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
router.get('/profesores', async (_req, res) => {
  try {
    const profesores = await profesorService.getAllProfesores();
    res.json(profesores);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los profesores' });
  }
});

// Obtener todas las mesas
router.get('/mesas', async (_req, res) => {
  try {
    const mesas = await mesaService.getAllMesas();
    res.json(mesas);
  } catch (error) {
    console.error('Error al obtener mesas:', error);
    res.status(500).json({ error: 'Error al obtener las mesas' });
  }
});

// Obtener una mesa por ID
router.get('/mesas/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID no proporcionado' });
    }
    const mesa = await mesaService.getMesaById(parseInt(id))

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
    const {
      profesor,
      vocal,
      carrera,
      materia,
      fecha,
      descripcion,
      cargo,
      verification,
      modalidad,
      aula,
      webexLink,
    } = req.body;

    // Validar datos requeridos
    if (!profesor || !vocal || !carrera || !materia || !fecha) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Validar formato de fecha
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) {
      return res.status(400).json({ error: 'Formato de fecha inválido' });
    }

    console.log('Fecha original:', fecha);
    console.log('Fecha como Date:', fechaObj.toISOString());

    // Usar la fecha directamente sin convertir
    const fechaFinal = fechaObj;

    // Validar modalidad
    if (modalidad && !['Presencial', 'Virtual'].includes(modalidad)) {
      return res.status(400).json({ error: 'Modalidad inválida' });
    }

    // Validar campos según modalidad
    if (modalidad === 'Presencial' && !aula) {
      return res.status(400).json({ error: 'El campo aula es requerido para modalidad presencial' });
    }

    if (modalidad === 'Virtual' && !webexLink) {
      return res.status(400).json({ error: 'El campo webexLink es requerido para modalidad virtual' });
    }

    const mesa = await mesaService.createMesa({
      profesor,
      vocal,
      carrera,
      materia,
      fecha: fechaFinal.toISOString(),
      descripcion,
      cargo,
      verification: verification ?? false,
      modalidad,
      aula,
      webexLink,
    });

    res.status(201).json(mesa);
  } catch (error) {
    console.error('Error al crear mesa:', error);
    res.status(500).json({ error: 'Error al crear la mesa' });
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
    const profesorId = req.params.profesorId;
    if (!profesorId) {
      return res.status(400).json({ error: 'ID de profesor no proporcionado' });
    }
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

    if (!profesorId || !carreras || !materias) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Actualizar carreras del profesor
    await prisma.profesor.update({
      where: { id: profesorId },
      data: {
        carreras: {
          set: carreras.map((id: string) => ({ id }))
        },
        materias: {
          set: materias.map((id: string) => ({ id }))
        }
      }
    });

    // Obtener el profesor actualizado con sus relaciones
    const profesorActualizado = await prisma.profesor.findUnique({
      where: { id: profesorId },
      include: {
        carreras: {
          select: {
            id: true,
            nombre: true
          }
        },
        materias: {
          select: {
            id: true,
            nombre: true,
            carreraId: true
          }
        }
      }
    });

    res.json(profesorActualizado);
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      error: 'Error al actualizar la configuración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router;
