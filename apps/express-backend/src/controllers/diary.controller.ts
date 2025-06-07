import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getAceptacionesProfesor = async (req: Request, res: Response) => {
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
};

export const getAceptaciones = async (req: Request, res: Response) => {
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

export const crearAceptacionMesa = async (req: Request, res: Response) => {
    try {
        const { mesaId, profesorId, estado } = req.body;

        if (!mesaId || !profesorId || !estado) {
            return res.status(400).json({ error: "Faltan parámetros requeridos" });
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
        res.status(500).json({ error: "Error al crear/actualizar aceptación" });
    }
}; 