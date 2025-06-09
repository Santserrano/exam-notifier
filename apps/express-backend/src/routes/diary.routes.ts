import { Router } from "express";

import {
  crearAceptacionMesa,
  getAceptaciones,
  getAceptacionesProfesor,
} from "../controllers/diary.controller.js";
import { validateApiKey } from "../middleware/auth.js";

const router = Router();

// Middleware para validar API key
router.use(validateApiKey);

// Rutas para aceptaciones de mesas
router.get("/mesas/aceptaciones/profesor/:profesorId", getAceptacionesProfesor);
router.get("/mesas/aceptaciones", getAceptaciones);
router.post("/mesas/:mesaId/aceptacion", crearAceptacionMesa);

export default router;
