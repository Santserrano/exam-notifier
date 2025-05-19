import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const carrerasYMaterias = {
    "Ingeniería en Sistemas": [
        "Algoritmos y Estructuras de Datos",
        "Análisis Matemático I",
        "Análisis Matemático II",
        "Análisis Matemático III",
        "Arquitectura de Computadoras",
        "Base de Datos",
        "Cálculo Numérico",
        "Comunicación de Datos",
        "Diseño de Sistemas",
        "Economía",
        "Elementos de Programación y Lógica",
        "Física I",
        "Física II",
        "Ingeniería de Software I",
        "Ingeniería de Software II",
        "Ingeniería de Software III",
        "Inglés I",
        "Inglés II",
        "Inglés III",
        "Inglés IV",
        "Introducción a la Programación",
        "Investigación Operativa",
        "Lenguajes de Programación",
        "Matemática Discreta",
        "Paradigmas de Programación",
        "Probabilidad y Estadística",
        "Programación Orientada a Objetos",
        "Redes de Computadoras",
        "Sistemas de Información",
        "Sistemas Operativos",
        "Teoría de la Computación"
    ],
    "Arquitectura": [
        "Análisis Matemático I",
        "Análisis Matemático II",
        "Dibujo Técnico I",
        "Dibujo Técnico II",
        "Física I",
        "Física II",
        "Geometría Descriptiva",
        "Historia de la Arquitectura I",
        "Historia de la Arquitectura II",
        "Materiales y Técnicas Constructivas",
        "Proyecto Arquitectónico I",
        "Proyecto Arquitectónico II",
        "Proyecto Arquitectónico III",
        "Proyecto Arquitectónico IV",
        "Proyecto Arquitectónico V",
        "Teoría de la Arquitectura"
    ],
    "Licenciatura en Sistemas de Información": [
        "Algoritmos y Estructuras de Datos",
        "Análisis Matemático I",
        "Análisis Matemático II",
        "Base de Datos",
        "Comunicación de Datos",
        "Diseño de Sistemas",
        "Elementos de Programación y Lógica",
        "Ingeniería de Software I",
        "Ingeniería de Software II",
        "Inglés I",
        "Inglés II",
        "Introducción a la Programación",
        "Lenguajes de Programación",
        "Matemática Discreta",
        "Paradigmas de Programación",
        "Probabilidad y Estadística",
        "Programación Orientada a Objetos",
        "Redes de Computadoras",
        "Sistemas de Información",
        "Sistemas Operativos"
    ],
    "Licenciatura en Diseño Gráfico y Multimedia": [],
    "Licenciatura en Diseño de Indumentaria y Textil": [],
    "Técnico en Comunicación Gráfico en Diseño": [],
    "Técnico Universitario en Sistemas de Información": [],
    "Analista Universitario en Sistemas de Información": [],
    "Ingeniería en Sistemas de Información": [],
    "Técnico Universitario en Diseño y Programación de Videojuegos": [],
    "Licenciatura en Psicopedagogía": [],
    "Licenciatura en Psicología": [],
    "Licenciatura en Publicidad": [],
    "Profesorado en Educación Primaria": [],
    "Licenciatura en Nutrición": [],
    "Licenciatura en Fonoaudiología": [],
    "Abogacía": [],
    "Licenciatura en Diseño de Muebles e Interiores": [],
    "Licenciatura en Criminalística": [],
    "Contador Público": [],
    "Analista Universitario Contable": [],
    "Licenciatura en Administración de Empresas": [],
    "Analista Universitario en Administración de Empresas": []
};

async function main() {
    console.log('Iniciando seed...');

    // Crear carreras y sus materias
    for (const [nombreCarrera, materias] of Object.entries(carrerasYMaterias)) {
        console.log(`Creando carrera: ${nombreCarrera}`);

        const carrera = await prisma.carrera.upsert({
            where: { nombre: nombreCarrera },
            update: {},
            create: { nombre: nombreCarrera }
        });

        console.log(`Creando materias para ${nombreCarrera}`);
        for (const nombreMateria of materias) {
            await prisma.materia.upsert({
                where: {
                    nombre_carreraId: {
                        nombre: nombreMateria,
                        carreraId: carrera.id
                    }
                },
                update: {},
                create: {
                    nombre: nombreMateria,
                    carreraId: carrera.id
                }
            });
        }
    }

    console.log('Seed completado exitosamente');
}

main()
    .catch((e) => {
        console.error('Error durante el seed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    }); 