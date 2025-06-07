import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Crear carreras
    const carreras = await Promise.all([
        prisma.carrera.upsert({
            where: { nombre: 'Ingeniería en Informática' },
            update: {},
            create: {
                nombre: 'Ingeniería en Informática',
            },
        }),
        prisma.carrera.upsert({
            where: { nombre: 'Ingeniería en Sistemas' },
            update: {},
            create: {
                nombre: 'Ingeniería en Sistemas',
            },
        }),
        prisma.carrera.upsert({
            where: { nombre: 'Licenciatura en Análisis de Sistemas' },
            update: {},
            create: {
                nombre: 'Licenciatura en Análisis de Sistemas',
            },
        }),
        prisma.carrera.upsert({
            where: { nombre: 'Tecnicatura en Programación' },
            update: {},
            create: {
                nombre: 'Tecnicatura en Programación',
            },
        }),
        prisma.carrera.upsert({
            where: { nombre: 'Ingeniería en Software' },
            update: {},
            create: {
                nombre: 'Ingeniería en Software',
            },
        }),
        prisma.carrera.upsert({
            where: { nombre: 'Licenciatura en Ciencias de la Computación' },
            update: {},
            create: {
                nombre: 'Licenciatura en Ciencias de la Computación',
            },
        }),
    ]);

    // Crear materias
    const materias = await Promise.all([
        // Materias para Ingeniería en Informática
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Programación I',
                    carreraId: carreras[0].id,
                },
            },
            update: {},
            create: {
                nombre: 'Programación I',
                carreraId: carreras[0].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Base de Datos',
                    carreraId: carreras[0].id,
                },
            },
            update: {},
            create: {
                nombre: 'Base de Datos',
                carreraId: carreras[0].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Estructuras de Datos',
                    carreraId: carreras[0].id,
                },
            },
            update: {},
            create: {
                nombre: 'Estructuras de Datos',
                carreraId: carreras[0].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Sistemas Operativos',
                    carreraId: carreras[0].id,
                },
            },
            update: {},
            create: {
                nombre: 'Sistemas Operativos',
                carreraId: carreras[0].id,
            },
        }),

        // Materias para Ingeniería en Sistemas
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Programación II',
                    carreraId: carreras[1].id,
                },
            },
            update: {},
            create: {
                nombre: 'Programación II',
                carreraId: carreras[1].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Redes',
                    carreraId: carreras[1].id,
                },
            },
            update: {},
            create: {
                nombre: 'Redes',
                carreraId: carreras[1].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Arquitectura de Computadoras',
                    carreraId: carreras[1].id,
                },
            },
            update: {},
            create: {
                nombre: 'Arquitectura de Computadoras',
                carreraId: carreras[1].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Ingeniería de Software',
                    carreraId: carreras[1].id,
                },
            },
            update: {},
            create: {
                nombre: 'Ingeniería de Software',
                carreraId: carreras[1].id,
            },
        }),

        // Materias para Licenciatura en Análisis de Sistemas
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Análisis de Sistemas',
                    carreraId: carreras[2].id,
                },
            },
            update: {},
            create: {
                nombre: 'Análisis de Sistemas',
                carreraId: carreras[2].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Diseño de Sistemas',
                    carreraId: carreras[2].id,
                },
            },
            update: {},
            create: {
                nombre: 'Diseño de Sistemas',
                carreraId: carreras[2].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Gestión de Proyectos',
                    carreraId: carreras[2].id,
                },
            },
            update: {},
            create: {
                nombre: 'Gestión de Proyectos',
                carreraId: carreras[2].id,
            },
        }),

        // Materias para Tecnicatura en Programación
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Programación Web',
                    carreraId: carreras[3].id,
                },
            },
            update: {},
            create: {
                nombre: 'Programación Web',
                carreraId: carreras[3].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Desarrollo de Aplicaciones Móviles',
                    carreraId: carreras[3].id,
                },
            },
            update: {},
            create: {
                nombre: 'Desarrollo de Aplicaciones Móviles',
                carreraId: carreras[3].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Testing de Software',
                    carreraId: carreras[3].id,
                },
            },
            update: {},
            create: {
                nombre: 'Testing de Software',
                carreraId: carreras[3].id,
            },
        }),

        // Materias para Ingeniería en Software
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Desarrollo de Software',
                    carreraId: carreras[4].id,
                },
            },
            update: {},
            create: {
                nombre: 'Desarrollo de Software',
                carreraId: carreras[4].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Calidad de Software',
                    carreraId: carreras[4].id,
                },
            },
            update: {},
            create: {
                nombre: 'Calidad de Software',
                carreraId: carreras[4].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Patrones de Diseño',
                    carreraId: carreras[4].id,
                },
            },
            update: {},
            create: {
                nombre: 'Patrones de Diseño',
                carreraId: carreras[4].id,
            },
        }),

        // Materias para Licenciatura en Ciencias de la Computación
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Algoritmos y Complejidad',
                    carreraId: carreras[5].id,
                },
            },
            update: {},
            create: {
                nombre: 'Algoritmos y Complejidad',
                carreraId: carreras[5].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Inteligencia Artificial',
                    carreraId: carreras[5].id,
                },
            },
            update: {},
            create: {
                nombre: 'Inteligencia Artificial',
                carreraId: carreras[5].id,
            },
        }),
        prisma.materia.upsert({
            where: {
                nombre_carreraId: {
                    nombre: 'Computación Gráfica',
                    carreraId: carreras[5].id,
                },
            },
            update: {},
            create: {
                nombre: 'Computación Gráfica',
                carreraId: carreras[5].id,
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
        prisma.MesaAceptacion.create({
            data: {
                mesaId: mesas[0].id,
                profesorId: profesores[0].id,
                estado: 'ACEPTADA',
            },
        }),
        prisma.MesaAceptacion.create({
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