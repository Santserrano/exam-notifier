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
  const total = aceptaciones.length;
  const aceptadas = aceptaciones.filter(a => a.estado === "ACEPTADA").length;
  const rechazadas = aceptaciones.filter(a => a.estado === "RECHAZADA").length;
  const pendientes = aceptaciones.filter(a => a.estado === "PENDIENTE").length;

  return (
    <div
      className={`${styles.bg} flex cursor-pointer flex-col gap-2 rounded-lg p-4 ${styles.text}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${styles.dot}`} />
          <span className="text-sm font-medium">{modalidad}</span>
        </div>
        <div className="text-sm font-medium">
          {aceptadas}/{total} aceptadas
        </div>
      </div>
      <div className="text-lg font-semibold">{materia}</div>
      <div className="text-sm">{carrera}</div>
      <div className="text-sm">
        {dia} {mes}
      </div>
      {aceptaciones.length > 0 && (
        <div className="mt-2 flex flex-col gap-1">
          {aceptaciones.map((aceptacion, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <span>
                {aceptacion.profesor.nombre} {aceptacion.profesor.apellido}
              </span>
              <div className={`flex items-center gap-1 ${getEstadoColor(aceptacion.estado)}`}>
                {getEstadoIcon(aceptacion.estado)}
                <span>{aceptacion.estado}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MesaCardAdmin;
