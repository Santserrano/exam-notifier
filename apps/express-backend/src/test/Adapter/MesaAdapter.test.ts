import { MesaDeExamen } from '@prisma/client';

import { MesaAdapter } from '../../Adapters/MasaAdapter';

describe('MesaAdapter', () => {
  const adapter = new MesaAdapter();

  // Mock completo
  const fullMock: MesaDeExamen = {
    id: 1,
    profesorId: 'prof-123',
    vocalId: 'vocal-456',
    carreraId: 'carrera-789',
    materiaId: 'materia-012',
    fecha: new Date('2023-01-01T10:00:00Z'),
    horaTexto: '10:00',
    descripcion: 'Examen Final',
    cargo: 'Titular',
    verification: true,
    createdAt: new Date('2022-12-01T08:00:00Z'),
    modalidad: 'Presencial',
    aula: 'Aula 101',
    webexLink: 'https://webex.com/exam-room',
    updatedAt: new Date('2022-12-01T08:00:00Z'),
  };

  // Mock con campos opcionales nulos
  const nullMock: MesaDeExamen = {
    ...fullMock,
    modalidad: null,
    aula: null,
    webexLink: null,
    horaTexto: null
  };

  // Mock sin campos opcionales
  const minimalMock = {
    id: 2,
    profesorId: 'prof-456',
    vocalId: 'vocal-789',
    carreraId: 'carrera-012',
    materiaId: 'materia-345',
    fecha: new Date('2023-02-01T10:00:00Z'),
    horaTexto: null,
    descripcion: 'Examen Parcial',
    cargo: 'Suplente',
    verification: false,
    createdAt: new Date('2022-12-15T08:00:00Z'),
    updatedAt: new Date('2022-12-15T08:00:00Z')
  } as MesaDeExamen;

  it('should correctly adapt full MesaDeExamen to MesaData', () => {
    const result = adapter.adapt(fullMock);

    expect(result).toEqual({
      id: 1,
      profesor: 'prof-123',
      vocal: 'vocal-456',
      carrera: 'carrera-789',
      materia: 'materia-012',
      fecha: new Date('2023-01-01T10:00:00Z'),
      horaTexto: '10:00',
      descripcion: 'Examen Final',
      cargo: 'Titular',
      verification: true,
      createdAt: new Date('2022-12-01T08:00:00Z'),
      updatedAt: new Date('2022-12-01T08:00:00Z'),
      modalidad: 'Presencial',
      aula: 'Aula 101',
      webexLink: 'https://webex.com/exam-room'
    });
  });

  it('should handle null optional fields', () => {
    const result = adapter.adapt(nullMock);

    expect(result).toEqual({
      id: 1,
      profesor: 'prof-123',
      vocal: 'vocal-456',
      carrera: 'carrera-789',
      materia: 'materia-012',
      fecha: new Date('2023-01-01T10:00:00Z'),
      horaTexto: null,
      descripcion: 'Examen Final',
      cargo: 'Titular',
      verification: true,
      createdAt: new Date('2022-12-01T08:00:00Z'),
      updatedAt: new Date('2022-12-01T08:00:00Z'),
      modalidad: null,
      aula: null,
      webexLink: null
    });
  });

  it('should handle missing optional fields', () => {
    const result = adapter.adapt(minimalMock);

    expect(result).toEqual({
      id: 2,
      profesor: 'prof-456',
      vocal: 'vocal-789',
      carrera: 'carrera-012',
      materia: 'materia-345',
      fecha: new Date('2023-02-01T10:00:00Z'),
      horaTexto: null,
      descripcion: 'Examen Parcial',
      cargo: 'Suplente',
      verification: false,
      createdAt: new Date('2022-12-15T08:00:00Z'),
      updatedAt: new Date('2022-12-15T08:00:00Z'),
      modalidad: null,
      aula: null,
      webexLink: null
    });
  });

  it('should maintain data integrity', () => {
    const result = adapter.adapt(fullMock);

    // Verificamos que los tipos sean correctos
    expect(typeof result.id).toBe('number');
    expect(typeof result.profesor).toBe('string');
    expect(result.fecha instanceof Date).toBe(true);
    expect(typeof result.verification).toBe('boolean');
  });

  it('should convert mesa to DTO', () => {
    const mockMesa = {
      id: 1,
      fecha: new Date(),
      horaTexto: '14:00',
      descripcion: 'Mesa de examen',
      cargo: 'Titular',
      verification: false,
      createdAt: new Date(),
      modalidad: 'Presencial',
      updatedAt: new Date(),
      profesorId: '1',
      vocalId: '2',
      aula: 'Aula 1',
      webexLink: null,
      carreraId: '1',
      materiaId: '1',
      profesor: {
        id: '1',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@example.com',
        telefono: '1234567890',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      vocal: {
        id: '2',
        nombre: 'María',
        apellido: 'González',
        email: 'maria@example.com',
        telefono: '0987654321',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      materia: {
        id: '1',
        nombre: 'Matemática',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      carrera: {
        id: '1',
        nombre: 'Ingeniería',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    const dto = MesaAdapter.toDTO(mockMesa);
    expect(dto).toEqual({
      id: mockMesa.id,
      fecha: mockMesa.fecha,
      horaTexto: mockMesa.horaTexto,
      descripcion: mockMesa.descripcion,
      cargo: mockMesa.cargo,
      verification: mockMesa.verification,
      createdAt: mockMesa.createdAt,
      modalidad: mockMesa.modalidad,
      updatedAt: mockMesa.updatedAt,
      profesor: {
        id: mockMesa.profesor.id,
        nombre: mockMesa.profesor.nombre,
        apellido: mockMesa.profesor.apellido,
        email: mockMesa.profesor.email,
        telefono: mockMesa.profesor.telefono
      },
      vocal: {
        id: mockMesa.vocal.id,
        nombre: mockMesa.vocal.nombre,
        apellido: mockMesa.vocal.apellido,
        email: mockMesa.vocal.email,
        telefono: mockMesa.vocal.telefono
      },
      materia: {
        id: mockMesa.materia.id,
        nombre: mockMesa.materia.nombre
      },
      carrera: {
        id: mockMesa.carrera.id,
        nombre: mockMesa.carrera.nombre
      },
      aula: mockMesa.aula,
      webexLink: mockMesa.webexLink
    });
  });
});