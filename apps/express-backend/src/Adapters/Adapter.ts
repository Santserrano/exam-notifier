import { NewDiaryEntry, NewNotification, DiaryEntry, Notification } from '../interfaces/Interface'


const parseComent = (comemtFromRequest: any): string => {
  if (!isString(comemtFromRequest)) {
    throw new Error('Incorrect or missing comment')
  }
  return comemtFromRequest
}

const parseProfesor = (comemtFromRequest: any): number => {
  if (!isNumber(comemtFromRequest)) {
    throw new Error('Incorrect or missing comment')
  }
  return comemtFromRequest
}

const parseMaterias = (comemtFromRequest: any): string => {
  if (!isString(comemtFromRequest)) {
    throw new Error('Incorrect or missing comment')
  }
  return comemtFromRequest
}

const parseDescripcion = (comemtFromRequest: any): string => {
  if (!isString(comemtFromRequest)) {
    throw new Error('Incorrect or missing comment')
  }
  return comemtFromRequest
}

const parsePosicion = (comemtFromRequest: any): string => {
  if (!isString(comemtFromRequest)) {
    throw new Error('Incorrect or missing comment')
  }
  return comemtFromRequest
}

const parseDate = (comemtFromRequest: Date): Date => {
  if (!isDate(comemtFromRequest)) {
    throw new Error('Incorrect or missing comment')
  }
  return comemtFromRequest
}

const parseVerification = (comemtFromRequest: boolean): boolean => {
  if (!isBoolean(comemtFromRequest)) {
    throw new Error('Incorrect or missing comment')
  }
  return comemtFromRequest
}

const isNumber =(Number: number): boolean =>{
  return typeof Number === 'number' && !isNaN(Number)
}

const isString = (string: String): boolean => {
  return typeof string === 'string'
}

const isBoolean = (boolean: boolean): boolean => {
  return typeof boolean === 'boolean'
}

const isDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime())
}

export const toNewDaiaryEntry = (object: any): NewDiaryEntry => {
  const newEntry: NewDiaryEntry = {
    profesor: parseProfesor(object.profesor),
    vocal: parseProfesor(object.vocal),
    carrera: parseComent(object.carrera),
    materia: parseMaterias(object.materias),
    fecha: parseDate(object.fechaMesa),
    descripcion: parseDescripcion(object.descripcion),
    cargo: parsePosicion(object.posicion),
    verification: parseVerification(object.verification),
    createdAt: parseDate(object.createdAt)
  }

  return newEntry
}

export const toNewNotification = (object: any): NewNotification => {
  const newEntry: NewNotification = {
    profesor: parseProfesor(object.profesor),
    vocal: parseProfesor(object.vocal),
    mensage: object.mensage,
    fechaMesa: parseDate(object.fechaMesa),
    materia: parseMaterias(object.materia),
    carrera: parseComent(object.carrera),
    cargo: parsePosicion(object.cargo),
    leido: parseVerification(object.leido),
    createAt: parseDate(object.createdAt)
  }
  return newEntry
}

export const diaryEntryToNotification = (diaryEntry: DiaryEntry): Notification => {
  // Ensure diaryEntry.materia has a valid type
  const notification: Notification = {
    id: diaryEntry.id, // Usa el mismo ID del DiaryEntry
    profesor: diaryEntry.profesor,
    vocal: diaryEntry.profesor,
    mensage: `Nueva notificación para la materia ${diaryEntry.materia as string}`,
    fechaMesa: diaryEntry.fecha,
    materia: diaryEntry.materia,
    carrera: diaryEntry.carrera,
    cargo: diaryEntry.cargo,
    leido: false, // Por defecto, las notificaciones no están leídas
    createAt: new Date() // Fecha de creación de la notificación
  }

  return notification
}
