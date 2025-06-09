export interface MesaData {
  id: number;
  profesor: string;
  vocal: string;
  carrera: string;
  materia: string;
  fecha: Date;
  descripcion: string;
  cargo: string;
  verification: boolean;
  createdAt: Date;
  modalidad?: string | null;
  aula?: string | null;
  webexLink?: string | null;
}

export interface MesaResponse {
  success: boolean;
  data?: MesaData;
  error?: string;
}
