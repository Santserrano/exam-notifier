"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var carreras, materias, profesores, mesas, alumnos;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all([
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
                    ])];
                case 1:
                    carreras = _a.sent();
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 2:
                    materias = _a.sent();
                    return [4 /*yield*/, Promise.all([
                            prisma.profesor.create({
                                data: {
                                    id: 'user_2xT6hVLUgiccrHqMaxJDlC7NeCY',
                                    nombre: 'Juan',
                                    apellido: 'Pérez',
                                    email: 'juan.perez@example.com',
                                    telefono: '1234567890',
                                    carreras: {
                                        connect: [carreras[0].id, carreras[1].id].map(function (id) { return ({ id: id }); }),
                                    },
                                    materias: {
                                        connect: [materias[0].id, materias[2].id].map(function (id) { return ({ id: id }); }),
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
                                        connect: [carreras[0].id, carreras[2].id].map(function (id) { return ({ id: id }); }),
                                    },
                                    materias: {
                                        connect: [materias[1].id, materias[4].id].map(function (id) { return ({ id: id }); }),
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
                                        connect: [carreras[1].id, carreras[2].id].map(function (id) { return ({ id: id }); }),
                                    },
                                    materias: {
                                        connect: [materias[3].id, materias[4].id].map(function (id) { return ({ id: id }); }),
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
                        ])];
                case 3:
                    profesores = _a.sent();
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 4:
                    mesas = _a.sent();
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 5:
                    alumnos = _a.sent();
                    // Crear algunas aceptaciones de mesas
                    return [4 /*yield*/, Promise.all([
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
                        ])];
                case 6:
                    // Crear algunas aceptaciones de mesas
                    _a.sent();
                    console.log('Base de datos poblada exitosamente');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
