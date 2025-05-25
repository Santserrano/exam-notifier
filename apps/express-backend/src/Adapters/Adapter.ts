import { NewDiaryEntry, NewNotification, DiaryEntry, Notification } from '../interfaces/Interface'

// Validadores genéricos
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && !isNaN(value)

const isString = (value: unknown): value is string =>
  typeof value === 'string'

const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean'

const isDate = (value: unknown): value is Date =>
  value instanceof Date && !isNaN(value.getTime())

const parseNumber = (value: unknown, field: string): number => {
  if (isNumber(value)) return value
  if (isString(value) && !isNaN(Number(value))) return Number(value)
  throw new Error(`Campo ${field} incorrecto o faltante`)
}

const parseString = (value: unknown, field: string): string => {
  if (isString(value)) return value
  throw new Error(`Campo ${field} incorrecto o faltante`)
}

const parseBoolean = (value: unknown, field: string): boolean => {
  if (isBoolean(value)) return value
  if (value === 'true') return true
  if (value === 'false') return false
  throw new Error(`Campo ${field} incorrecto o faltante`)
}

const parseDate = (value: unknown, field: string): Date => {
  if (isDate(value)) return value
  if (isString(value) && !isNaN(Date.parse(value))) return new Date(value)
  throw new Error(`Campo ${field} incorrecto o faltante`)
}

// Adaptadores principales
export function toNewDaiaryEntry(object: Record<string, unknown>): NewDiaryEntry {
  return {
    profesor: parseNumber(object.profesor, 'profesor'),
    vocal: parseNumber(object.vocal, 'vocal'),
    carrera: parseString(object.carrera, 'carrera'),
    materia: parseString(object.materia, 'materia'),
    fecha: parseDate(object.fecha, 'fecha'),
    descripcion: parseString(object.descripcion, 'descripcion'),
    cargo: parseString(object.cargo, 'cargo'),
    verification: parseBoolean(object.verification, 'verification'),
    createdAt: object.createdAt ? parseDate(object.createdAt, 'createdAt') : new Date()
  }
}

export function toNewNotification(object: Record<string, unknown>): NewNotification {
  return {
    profesor: parseNumber(object.profesor, 'profesor'),
    vocal: parseNumber(object.vocal, 'vocal'),
    mensage: parseString(object.mensage, 'mensage'),
    fechaMesa: parseDate(object.fechaMesa, 'fechaMesa'),
    materia: parseString(object.materia, 'materia'),
    carrera: parseString(object.carrera, 'carrera'),
    cargo: parseString(object.cargo, 'cargo'),
    leido: parseBoolean(object.leido, 'leido'),
    createAt: object.createdAt ? parseDate(object.createdAt, 'createdAt') : new Date()
  }
}

export function diaryEntryToNotification(diaryEntry: DiaryEntry): Notification {
  return {
    id: diaryEntry.id,
    profesor: diaryEntry.profesor,
    vocal: diaryEntry.vocal,
    mensage: `Nueva notificación para la materia ${diaryEntry.materia}`,
    fechaMesa: diaryEntry.fecha,
    materia: diaryEntry.materia,
    carrera: diaryEntry.carrera,
    cargo: diaryEntry.cargo,
    leido: false,
    createAt: new Date()
  }
}
