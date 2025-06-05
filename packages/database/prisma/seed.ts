import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Crear carreras
    const carreras = await Promise.all([
        prisma.carrera.create({
            data: {
                nombre: 'Ingeniería en Informática',
            },
        }),
        prisma.carrera.create({
            data: {
                nombre: 'Ingeniería en Sistemas',
            },
        }),
        prisma.carrera.create({
            data: {
                nombre: 'Licenciatura en Análisis de Sistemas',
            },
        }),
    ]);

    // Crear materias
    const materias = await Promise.all([
        prisma.materia.create({
            data: {
                nombre: 'Programación I',
                carreraId: carreras[0].id,
            },
        }),
        prisma.materia.create({
            data: {
                nombre: 'Base de Datos',
                carreraId: carreras[0].id,
            },
        }),
        prisma.materia.create({
            data: {
                nombre: 'Programación II',
                carreraId: carreras[1].id,
            },
        }),
        prisma.materia.create({
            data: {
                nombre: 'Redes',
                carreraId: carreras[1].id,
            },
        }),
        prisma.materia.create({
            data: {
                nombre: 'Análisis de Sistemas',
                carreraId: carreras[2].id,
            },
        }),
    ]);

    // Crear profesores
    const profesores = await Promise.all([
        prisma.profesor.create({
            data: {
                id: 'user_2xT6hVLUgiccrHqMaxJDlC7NeCY',
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan.perez@example.com',
                telefono: '1234567890',
                carreras: {
                    connect: [carreras[0].id, carreras[1].id].map(id => ({ id })),
                },
                materias: {
                    connect: [materias[0].id, materias[2].id].map(id => ({ id })),
                },
                notificacionConfig: {
                    create: {
                        webPushEnabled: true,
                        emailEnabled: true,
                        smsEnabled: true,
                    },
                },
            },
        }),
        prisma.profesor.create({
            data: {
                id: 'user_2x67Qpd7I2Cqxu750sdG61wEflV',
                nombre: 'María',
                apellido: 'González',
                email: 'maria.gonzalez@example.com',
                telefono: '0987654321',
                carreras: {
                    connect: [carreras[0].id, carreras[2].id].map(id => ({ id })),
                },
                materias: {
                    connect: [materias[1].id, materias[4].id].map(id => ({ id })),
                },
                notificacionConfig: {
                    create: {
                        webPushEnabled: true,
                        emailEnabled: true,
                        smsEnabled: false,
                    },
                },
            },
        }),
        prisma.profesor.create({
            data: {
                id: 'user_3xT6hVLUgiccrHqMaxJDlC7NeCY',
                nombre: 'Carlos',
                apellido: 'Rodríguez',
                email: 'carlos.rodriguez@example.com',
                telefono: '5555555555',
                carreras: {
                    connect: [carreras[1].id, carreras[2].id].map(id => ({ id })),
                },
                materias: {
                    connect: [materias[3].id, materias[4].id].map(id => ({ id })),
                },
                notificacionConfig: {
                    create: {
                        webPushEnabled: false,
                        emailEnabled: true,
                        smsEnabled: true,
                    },
                },
            },
        }),
    ]);

    // Crear algunas mesas de examen
    const mesas = await Promise.all([
        prisma.mesaDeExamen.create({
            data: {
                profesorId: profesores[0].id,
                vocalId: profesores[1].id,
                carreraId: carreras[0].id,
                materiaId: materias[0].id,
                fecha: new Date('2024-07-15T14:00:00Z'),
                descripcion: 'Primer Parcial',
                cargo: 'Titular',
                verification: false,
                modalidad: 'Presencial',
                aula: 'Aula 101',
            },
        }),
        prisma.mesaDeExamen.create({
            data: {
                profesorId: profesores[1].id,
                vocalId: profesores[2].id,
                carreraId: carreras[1].id,
                materiaId: materias[2].id,
                fecha: new Date('2024-07-20T10:00:00Z'),
                descripcion: 'Segundo Parcial',
                cargo: 'Titular',
                verification: false,
                modalidad: 'Virtual',
                webexLink: 'https://webex.com/example',
            },
        }),
    ]);

    // Crear algunos alumnos
    const alumnos = await Promise.all([
        prisma.alumno.create({
            data: {
                nombre: 'Ana',
                apellido: 'Martínez',
                carrera: 'Ingeniería en Informática',
                dni: '12345678',
                mesas: {
                    connect: [{ id: mesas[0].id }],
                },
            },
        }),
        prisma.alumno.create({
            data: {
                nombre: 'Pedro',
                apellido: 'Sánchez',
                carrera: 'Ingeniería en Sistemas',
                dni: '87654321',
                mesas: {
                    connect: [{ id: mesas[1].id }],
                },
            },
        }),
    ]);

    // Crear algunas aceptaciones de mesas
    await Promise.all([
        prisma.mesaAceptacion.create({
            data: {
                mesaId: mesas[0].id,
                profesorId: profesores[0].id,
                estado: 'ACEPTADA',
            },
        }),
        prisma.mesaAceptacion.create({
            data: {
                mesaId: mesas[0].id,
                profesorId: profesores[1].id,
                estado: 'PENDIENTE',
            },
        }),
    ]);

    console.log('Base de datos poblada exitosamente');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 