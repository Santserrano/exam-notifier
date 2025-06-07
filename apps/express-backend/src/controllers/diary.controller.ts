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
        const aceptaciones = await prisma.mesaAceptacion.findMany({
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

export const crearAceptacionMesa = async (_req: Request, res: Response) => {
    try {
        const { mesaId, profesorId, estado } = _req.body;

        if (!mesaId || !profesorId || !estado) {
            return res.status(400).json({ error: "Faltan parámetros requeridos" });
        }

        // Validar que el estado sea válido
        if (!["PENDIENTE", "ACEPTADA", "RECHAZADA"].includes(estado)) {
            return res.status(400).json({ error: "Estado de aceptación inválido" });
        }

        // Verificar que la mesa existe
        const mesa = await prisma.mesaDeExamen.findUnique({
            where: { id: Number(mesaId) }
        });

        if (!mesa) {
            return res.status(404).json({ error: "Mesa no encontrada" });
        }

        // Verificar que el profesor existe
        const profesor = await prisma.profesor.findUnique({
            where: { id: profesorId }
        });

        if (!profesor) {
            return res.status(404).json({ error: "Profesor no encontrado" });
        }

        const aceptacion = await prisma.mesaAceptacion.upsert({
            where: {
                mesaId_profesorId: {
                    mesaId: Number(mesaId),
                    profesorId,
                },
            },
            update: {
                estado,
            },
            create: {
                mesaId: Number(mesaId),
                profesorId,
                estado,
            },
            include: {
                mesa: true,
                profesor: true,
            },
        });

        res.json(aceptacion);
    } catch (error) {
        console.error("Error al crear/actualizar aceptación:", error);
        res.status(500).json({
            error: "Error al crear/actualizar aceptación",
            details: error instanceof Error ? error.message : "Error desconocido"
        });
    }
}; 