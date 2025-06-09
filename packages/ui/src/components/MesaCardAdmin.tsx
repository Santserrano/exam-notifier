import { CheckCircle2, XCircle } from "lucide-react";
import React from "react";

export interface MesaCardProps {
  fecha: string;
  materia: string;
  carrera: string;
  modalidad: "Presencial" | "Virtual";
  color: string;
  onClick?: () => void;
  aceptaciones?: {
    profesor: {
      id: string;
      nombre: string;
      apellido: string;
    };
    estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
  }[];
}

export const MesaCardAdmin: React.FC<MesaCardProps> = ({
  fecha,
  materia,
  carrera,
  modalidad,
  color,
  onClick,
  aceptaciones = []
}) => {
  const [dia, mes] = fecha.split(" ");

  type ColorType = "green" | "blue";
  const colorStyles: Record<ColorType, { bg: string; dot: string; text: string }> = {
    green: {
      bg: "bg-green-100 border border-green-300",
      dot: "bg-green-600",
      text: "text-green-800"
    },
    blue: {
      bg: "bg-blue-100 border border-blue-300",
      dot: "bg-blue-600",
      text: "text-blue-800"
    }
  };
  const styles = colorStyles[(color as ColorType)] || colorStyles.green;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "ACEPTADA":
        return "text-green-600";
      case "RECHAZADA":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "ACEPTADA":
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case "RECHAZADA":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-yellow-400" />;
    }
  };

  // Resumen de aceptaciones
  const total = 2; // Siempre son 2 profesores (titular y vocal)
  const aceptadas = aceptaciones.filter(a => a.estado === "ACEPTADA").length;
  const rechazadas = aceptaciones.filter(a => a.estado === "RECHAZADA").length;
  const pendientes = total - aceptadas - rechazadas;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 p-4 mb-4 rounded-3xl border ${color === "green" ? "border-green-200" : "border-blue-200"} shadow hover:shadow-md transition cursor-pointer bg-white ring-2 ring-transparent ${color === "green" ? "hover:ring-green-200" : "hover:ring-blue-200"}`}
    >
      {/* Fecha */}
      <div className="flex flex-col items-center justify-center w-14">
        <span className="text-2xl font-bold text-blue-900 leading-none">{dia}</span>
        <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wide">{mes}</span>
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-green-900 text-base truncate">{materia}</div>
        <div className="text-sm text-gray-500 truncate">{carrera}</div>
        {aceptaciones.length > 0 && (
          <div className="mt-2 flex flex-col gap-1">
            {aceptaciones.map((aceptacion, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {aceptacion.profesor.nombre} {aceptacion.profesor.apellido}
                </span>
                <div className={`flex items-center gap-1 ${getEstadoColor(aceptacion.estado)}`}>
                  {getEstadoIcon(aceptacion.estado)}
                  <span className="text-xs">{aceptacion.estado}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modalidad y Resumen */}
      <div className="flex flex-col items-end gap-2 min-w-[100px]">
        <div className={`flex items-center gap-2 ${styles.bg} px-3 py-1 rounded-full`}>
          <div className={`w-3 h-3 rounded-full ${styles.dot}`} />
          <span className={`text-xs font-medium ${styles.text}`}>{modalidad}</span>
        </div>
        <div className="text-xs text-gray-500">
          {aceptadas}/{total} aceptadas
        </div>
        {(rechazadas > 0 || pendientes > 0) && (
          <div className="text-xs text-gray-500">
            {rechazadas > 0 && <span className="text-red-600">{rechazadas} rechazadas</span>}
            {rechazadas > 0 && pendientes > 0 && <span className="mx-1">•</span>}
            {pendientes > 0 && <span className="text-yellow-600">{pendientes} pendientes</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesaCardAdmin;
