export interface DiaryEntry {
  id: number
  profesor: number
  vocal: number
  carrera: string
  materia: string
  fecha: Date
  descripcion: string
  cargo: string
  verification: boolean
  createdAt: Date
}

export interface Notification {
  id: number
  profesor: number
  vocal: number
  mensage: string
  fechaMesa: Date
  materia: string
  carrera: string
  cargo: string
  leido: boolean
  createAt: Date
}

export type NewDiaryEntry = Omit<DiaryEntry, 'id'>
export type NoSensitiveInfoDiaryEntry = Omit<DiaryEntry, 'id' | 'verification'>
export type NewNotification = Omit<Notification, 'id'>
export type NoSensitiveInfoNotification = Omit<Notification, 'id' | 'leido'>
