import express from 'express'
import * as diariesServi from '../service/diariesServi'
import { toNewDaiaryEntry, toNewNotification } from '../Adapters/Adapter'
import { sendPushNotification } from '../service/notifications'
import { Router } from 'express'
import { MesaService } from '../service/mesaService'
import { ProfesorService } from '../service/profesorService'

const router = express.Router()
const mesaService = new MesaService()
const profesorService = new ProfesorService()

// Middleware para validar API key
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "API key inválida" });
  }
  next();
};

// Aplicar middleware a todas las rutas
router.use(validateApiKey);

// Obtener todos los profesores
router.get('/profesores', async (_req, res) => {
  try {
    const profesores = await profesorService.getAllProfesores();
    res.json(profesores);
  } catch (error) {
    console.error("Error al obtener profesores:", error);
    res.status(500).json({ error: 'Error al obtener los profesores' });
  }
});

router.get('/', (_req, res) => {
  res.json(diariesServi.getEntrisWithoutSensitiveInfo())
})

router.get('/:id', (req, res) => {
  const diary = diariesServi.findById(+req.params.id)
  if (diary != null) {
    res.json(diary)
  } else {
    res.status(404).json({ error: 'Diary not found' })
  }
})

router.post('/', (req, res) => {
  try {
    const newDiaryEntry = toNewDaiaryEntry(req.body)
    const addDiaryEntry = diariesServi.addDiary(newDiaryEntry)
    res.json(addDiaryEntry)
  } catch (e) {
    res.status(400).json({ error: 'malformed data' })
  }
})

router.put('/:id', (req, res) => {
  try {
    const id = +req.params.id
    const updatedEntry = toNewDaiaryEntry(req.body)
    const diaryEntry = diariesServi.updateDiaryEntry(id, updatedEntry)
    if (diaryEntry != null) {
      res.json(diaryEntry)
    } else {
      res.status(404).json({ error: 'Diary entry not found' })
    }
  } catch (e) {
    res.status(400).json({ error: 'Malformed data or validation error' })
  }
})

router.post('/notifications', (req, res) => {
  try {
    const subscription = req.body.subscription
    const notificationData = toNewNotification(req.body.notification)

    if (typeof subscription !== 'object' || subscription === null) {
      res.status(400).json({ error: 'Missing subscription data' })
      return
    }

    sendPushNotification(subscription, notificationData)
    res.status(200).json({ message: 'Notification sent successfully' })
  } catch (error) {
    console.error('Error sending notification:', error)
    res.status(500).json({ error: 'Failed to send notification' })
  }
})

// Obtener todas las mesas
router.get('/mesas', async (req, res) => {
  try {
    const mesas = await mesaService.getAllMesas()
    if (!Array.isArray(mesas)) {
      console.error("Error: getAllMesas no devolvió un array")
      return res.status(500).json({ error: 'Error interno del servidor' })
    }
    res.json(mesas)
  } catch (error) {
    console.error("Error al obtener mesas:", error)
    res.status(500).json({ error: 'Error al obtener las mesas' })
  }
})

// Obtener una mesa por ID
router.get('/mesas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const mesa = await mesaService.getMesaById(id)

    if (!mesa) {
      return res.status(404).json({ error: 'Mesa no encontrada' })
    }

    res.json(mesa)
  } catch (error) {
    console.error("Error al obtener mesa:", error)
    res.status(500).json({ error: 'Error al obtener la mesa' })
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
        error: `Campos requeridos faltantes: ${camposFaltantes.join(', ')}`
      });
    }

    // Validar formato de fecha
    if (isNaN(new Date(mesaData.fecha).getTime())) {
      return res.status(400).json({
        error: 'Formato de fecha inválido'
      });
    }

    const nuevaMesa = await mesaService.createMesa(mesaData);
    res.status(201).json(nuevaMesa);
  } catch (error) {
    console.error("Error al crear mesa:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Error al crear la mesa'
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
    res.json(mesaActualizada)
  } catch (error) {
    console.error("Error al actualizar mesa:", error)
    res.status(500).json({ error: 'Error al actualizar la mesa' })
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
    res.json(mesa)
  } catch (error) {
    console.error("Error al eliminar mesa:", error)
    res.status(500).json({ error: 'Error al eliminar la mesa' })
  }
})

// Obtener mesas de un profesor específico
router.get('/mesas/profesor/:profesorId', async (req, res) => {
  try {
    const { profesorId } = req.params;
    const mesas = await mesaService.getMesasByProfesorId(profesorId);
    res.json(mesas);
  } catch (error) {
    console.error("Error al obtener mesas del profesor:", error);
    res.status(500).json({ error: 'Error al obtener las mesas del profesor' });
  }
});

export default router
