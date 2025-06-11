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
}
