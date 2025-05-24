import { notificacionService } from "../service/NotificationService";
import express from "express";

const router = express.Router();

// Middleware para validar API key
const validateApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey || apiKey !== process.env.INTERNAL_API_KEY) {
    return res.status(401).json({ error: "API key inválida" });
  }
  return next();
};

// Aplicar middleware a todas las rutas
router.use(validateApiKey);

// PATCH /notificaciones/config/:profesorId
router.patch('/notificaciones/config/:profesorId', async (req, res) => {
  const { profesorId } = req.params;
  const { webPushEnabled, smsEnabled, emailEnabled } = req.body;

  try {
    // Validar que al menos uno de los campos se envíe
    if (
      typeof webPushEnabled === 'undefined' &&
      typeof smsEnabled === 'undefined' &&
      typeof emailEnabled === 'undefined'
    ) {
      return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
    }

    // Construir objeto con los campos proporcionados
    const dataToUpdate: any = {};
    if (typeof webPushEnabled !== 'undefined') dataToUpdate.webPushEnabled = webPushEnabled;
    if (typeof smsEnabled !== 'undefined') dataToUpdate.smsEnabled = smsEnabled;
    if (typeof emailEnabled !== 'undefined') dataToUpdate.emailEnabled = emailEnabled;

    const updated = await notificacionService.updateConfig(profesorId, dataToUpdate);
    return res.json(updated);
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    return res.status(500).json({ error: 'Error al actualizar configuración' });
  }
});


// POST /notificaciones/push-subscription
router.post('/notificaciones/push-subscription', async (req, res) => {
  try {
    const { profesorId, subscription } = req.body;

    if (!profesorId || !subscription) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    if (!subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ error: 'Datos de suscripción inválidos' });
    }

    const { endpoint, keys } = subscription;

    if (!keys.auth || !keys.p256dh) {
      return res.status(400).json({ error: 'Claves de suscripción inválidas' });
    }

    const saved = await notificacionService.saveWebPushSubscription(profesorId, endpoint, keys);
    return res.status(201).json(saved);
  } catch (error) {
    console.error('Error guardando suscripción:', error);
    return res.status(500).json({
      error: 'Error al guardar suscripción',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// POST /notificaciones/config
router.post('/notificaciones/config', async (req, res) => {
  try {
    const { profesorId, webPushEnabled } = req.body;

    if (!profesorId) {
      return res.status(400).json({ error: 'ID de profesor requerido' });
    }

    const config = await notificacionService.updateConfig(profesorId, { webPushEnabled });
    return res.status(200).json(config);
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    return res.status(500).json({
      error: 'Error al actualizar configuración',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// GET /notificaciones/config/:profesorId
router.get('/notificaciones/config/:profesorId', async (req, res) => {
  const { profesorId } = req.params;
  try {
    const config = await notificacionService.getConfigByProfesor(profesorId);
    if (!config) {
      return res.status(404).json({ error: 'Configuración no encontrada' });
    }
    return res.json(config);
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return res.status(500).json({ error: 'Error al obtener configuración' });
  }
});

export default router;
