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
      horaTexto: req.body.hora || req.body.horaTexto,
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

// Rutas para aceptaciones de mesas
router.get("/mesas/aceptacion/profesor/:profesorId", async (req, res) => {
  try {
    const { profesorId } = req.params;
    if (!profesorId) {
      return res.status(400).json({ error: "ID del profesor es requerido" });
    }

    const aceptaciones = await prisma.mesaAceptacion.findMany({
      where: {
        profesorId
      },
      include: {
        mesa: true,
        profesor: true
      }
    });

    res.json(aceptaciones);
  } catch (error) {
    console.error("Error al obtener aceptaciones:", error);
    res.status(500).json({ error: "Error al obtener aceptaciones" });
  }
});

router.get("/mesas/aceptaciones", async (_req, res) => {
  try {
    console.log("Obteniendo todas las aceptaciones...");

    const aceptaciones = await prisma.mesaAceptacion.findMany({
      include: {
        mesa: {
          include: {
            materia: true,
            carrera: true
          }
        },
        profesor: true
      }
    });

    console.log(`Se encontraron ${aceptaciones.length} aceptaciones`);
    res.json(aceptaciones);
  } catch (error) {
    console.error("Error detallado al obtener aceptaciones:", error);
    res.status(500).json({
      error: "Error al obtener aceptaciones",
      details: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

router.post("/mesas/:mesaId/aceptacion", async (req, res) => {
  try {
    console.log("Recibiendo solicitud de aceptación:", {
      params: req.params,
      body: req.body,
      headers: req.headers
    });

    const { mesaId } = req.params;
    const { profesorId, estado } = req.body;

    if (!mesaId || !profesorId || !estado) {
      console.log("Faltan parámetros:", { mesaId, profesorId, estado });
      return res.status(400).json({ error: "Faltan parámetros requeridos" });
    }

    // Validar que el estado sea válido
    if (!["PENDIENTE", "ACEPTADA", "RECHAZADA"].includes(estado)) {
      console.log("Estado inválido:", estado);
      return res.status(400).json({ error: "Estado de aceptación inválido" });
    }

    // Convertir mesaId a número
    const mesaIdNum = parseInt(mesaId.toString(), 10);
    if (isNaN(mesaIdNum)) {
      console.log("ID de mesa inválido:", mesaId);
      return res.status(400).json({ error: "ID de mesa inválido" });
    }

    // Verificar que la mesa existe
    const mesa = await prisma.mesaDeExamen.findUnique({
      where: { id: mesaIdNum }
    });

    if (!mesa) {
      console.log("Mesa no encontrada:", mesaIdNum);
      return res.status(404).json({ error: "Mesa no encontrada" });
    }

    // Verificar que el profesor existe
    const profesor = await prisma.profesor.findUnique({
      where: { id: profesorId }
    });

    if (!profesor) {
      console.log("Profesor no encontrado:", profesorId);
      return res.status(404).json({ error: "Profesor no encontrado" });
    }

    // Verificar si ya existe una aceptación
    const aceptacionExistente = await prisma.mesaAceptacion.findUnique({
      where: {
        mesaId_profesorId: {
          mesaId: mesaIdNum,
          profesorId,
        },
      },
    });

    // Si ya existe una aceptación y no es PENDIENTE, no permitir cambios
    if (aceptacionExistente && aceptacionExistente.estado !== "PENDIENTE") {
      console.log("La mesa ya fue aceptada/rechazada anteriormente:", aceptacionExistente);
      return res.status(400).json({
        error: "La mesa ya fue aceptada/rechazada anteriormente",
        aceptacion: aceptacionExistente
      });
    }

    let aceptacion;
    if (aceptacionExistente) {
      console.log("Actualizando aceptación existente:", aceptacionExistente);
      aceptacion = await prisma.mesaAceptacion.update({
        where: {
          id: aceptacionExistente.id,
        },
        data: {
          estado,
        },
        include: {
          mesa: true,
          profesor: true,
        },
      });
    } else {
      console.log("Creando nueva aceptación");
      aceptacion = await prisma.mesaAceptacion.create({
        data: {
          mesaId: mesaIdNum,
          profesorId,
          estado,
        },
        include: {
          mesa: true,
          profesor: true,
        },
      });
    }

    console.log("Aceptación creada/actualizada:", aceptacion);
    return res.status(200).json({
      success: true,
      message: "Aceptación procesada correctamente",
      aceptacion
    });
  } catch (error) {
    console.error("Error al crear/actualizar aceptación:", error);
    return res.status(500).json({
      error: "Error al crear/actualizar aceptación",
      details: error instanceof Error ? error.message : "Error desconocido"
    });
  }
});

export default router;
