import { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

export const getAceptacionesProfesor = async (_req: Request, res: Response) => {
    try {
        const { profesorId } = _req.params;
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
};

export const getAceptaciones = async (_req: Request, res: Response) => {
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
};

export const crearAceptacionMesa = async (_req: Request, res: Response) => {
    try {
        console.log("Recibiendo solicitud de aceptación:", {
            params: _req.params,
            body: _req.body,
            headers: _req.headers
        });

        const { mesaId } = _req.params;
        const { profesorId, estado } = _req.body;

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

        console.log("Creando/actualizando aceptación:", {
            mesaId: mesaIdNum,
            profesorId,
            estado
        });

        // Primero intentamos encontrar una aceptación existente
        const aceptacionExistente = await prisma.mesaAceptacion.findUnique({
            where: {
                mesaId_profesorId: {
                    mesaId: mesaIdNum,
                    profesorId,
                },
            },
        });

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
        res.json(aceptacion);
    } catch (error) {
        console.error("Error al crear/actualizar aceptación:", error);
        res.status(500).json({
            error: "Error al crear/actualizar aceptación",
            details: error instanceof Error ? error.message : "Error desconocido"
        });
    }
}; 