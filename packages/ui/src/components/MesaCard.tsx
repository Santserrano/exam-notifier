import React from "react";

export interface MesaCardProps {
  fecha: string; // Ej: "5 mar.", "15 abr."
  materia: string;
  carrera: string;
  modalidad: "Presencial" | "Virtual";
  color: string; // color para el punto (ej: "green" o "blue")
  onClick?: () => void;
}

export const MesaCard: React.FC<MesaCardProps> = ({
  fecha,
  materia,
  carrera,
  modalidad,
  color,
  onClick,
}) => (
  <div
    className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm mb-2 cursor-pointer border border-gray-200 hover:shadow-md transition min-h-[64px]"
    onClick={onClick}
  >
    <div className="flex flex-col items-center justify-center w-12">
      <span className="text-lg font-bold text-blue-900 leading-none">{fecha.split(" ")[0]}</span>
      <span className="text-xs text-blue-900 uppercase">{fecha.split(" ")[1]}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-semibold text-base text-green-900 truncate">{materia}</div>
      <div className="text-xs text-gray-500 truncate">{carrera}</div>
    </div>
    <div className="flex items-center gap-1 min-w-[80px] justify-end">
      <span
        className={`inline-block w-3 h-3 rounded-full ${color === "green" ? "bg-green-700" : "bg-blue-700"}`}
      />
      <span className="text-xs text-gray-700">{modalidad}</span>
    </div>
  </div>
);

export default MesaCard; 