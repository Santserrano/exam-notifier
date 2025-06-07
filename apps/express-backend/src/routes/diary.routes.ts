import { Router } from "express";
import { getAceptacionesProfesor, crearAceptacionMesa, getAceptaciones } from "../controllers/diary.controller.js";

const router = Router();

// Rutas para aceptaciones de mesas
router.get("/mesas/aceptaciones/profesor/:profesorId", getAceptacionesProfesor);
router.get("/mesas/aceptaciones", getAceptaciones);
router.post("/mesas/:mesaId/aceptacion", crearAceptacionMesa);

export default router; 