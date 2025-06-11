import { MesaDeExamen } from '@prisma/client';

import { MesaData } from '../interfaces/Interface.js';
import { Adapter } from './Adapter.js';


export class MesaAdapter implements Adapter<MesaDeExamen, MesaData> {
    adapt(mesa: MesaDeExamen): MesaData {
        return {
            id: mesa.id,
            profesor: mesa.profesorId,
            vocal: mesa.vocalId,
            carrera: mesa.carreraId,
            materia: mesa.materiaId,
            fecha: mesa.fecha,
            horaTexto: mesa.horaTexto,
            descripcion: mesa.descripcion,
            cargo: mesa.cargo,
            verification: mesa.verification,
            createdAt: mesa.createdAt,
            updatedAt: mesa.updatedAt,
            modalidad: mesa.modalidad || null,
            aula: mesa.aula || null,
            webexLink: mesa.webexLink || null
        };
    }

    static toDTO(mesa: MesaDeExamen & {
        profesor: { id: string; nombre: string; apellido: string; email: string; telefono: string | null };
        vocal: { id: string; nombre: string; apellido: string; email: string; telefono: string | null };
        materia: { id: string; nombre: string };
        carrera: { id: string; nombre: string };
    }) {
        return {
            id: mesa.id,
            fecha: mesa.fecha,
            horaTexto: mesa.horaTexto,
            descripcion: mesa.descripcion,
            cargo: mesa.cargo,
            verification: mesa.verification,
            createdAt: mesa.createdAt,
            modalidad: mesa.modalidad,
            updatedAt: mesa.updatedAt,
            profesor: {
                id: mesa.profesor.id,
                nombre: mesa.profesor.nombre,
                apellido: mesa.profesor.apellido,
                email: mesa.profesor.email,
                telefono: mesa.profesor.telefono
            },
            vocal: {
                id: mesa.vocal.id,
                nombre: mesa.vocal.nombre,
                apellido: mesa.vocal.apellido,
                email: mesa.vocal.email,
                telefono: mesa.vocal.telefono
            },
            materia: {
                id: mesa.materia.id,
                nombre: mesa.materia.nombre
            },
            carrera: {
                id: mesa.carrera.id,
                nombre: mesa.carrera.nombre
            },
            aula: mesa.aula,
            webexLink: mesa.webexLink
        };
    }
}
