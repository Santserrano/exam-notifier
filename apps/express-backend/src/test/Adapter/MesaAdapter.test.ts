import { MesaDeExamen } from '@prisma/client';

import { MesaAdapter } from '../../Adapters/MesaAdapter.js';


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
    descripcion: 'Examen Final',
    cargo: 'Titular',
    verification: true,
    createdAt: new Date('2022-12-01T08:00:00Z'),
    modalidad: 'Presencial',
    aula: 'Aula 101',
    webexLink: 'https://webex.com/exam-room'
  };

  // Mock con campos opcionales nulos
  const nullMock: MesaDeExamen = {
    ...fullMock,
    modalidad: null,
    aula: null,
    webexLink: null
  };

  // Mock sin campos opcionales
  const minimalMock = {
    id: 2,
    profesorId: 'prof-456',
    vocalId: 'vocal-789',
    carreraId: 'carrera-012',
    materiaId: 'materia-345',
    fecha: new Date('2023-02-01T10:00:00Z'),
    descripcion: 'Examen Parcial',
    cargo: 'Suplente',
    verification: false,
    createdAt: new Date('2022-12-15T08:00:00Z')
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
      descripcion: 'Examen Final',
      cargo: 'Titular',
      verification: true,
      createdAt: new Date('2022-12-01T08:00:00Z'),
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
      descripcion: 'Examen Final',
      cargo: 'Titular',
      verification: true,
      createdAt: new Date('2022-12-01T08:00:00Z'),
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
      descripcion: 'Examen Parcial',
      cargo: 'Suplente',
      verification: false,
      createdAt: new Date('2022-12-15T08:00:00Z'),
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
});