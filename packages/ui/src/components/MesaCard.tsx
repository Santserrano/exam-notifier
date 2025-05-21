import React from "react";

export interface MesaCardProps {
  fecha: string;
  materia: string;
  carrera: string;
  modalidad: "Presencial" | "Virtual";
  color: string;
  onClick?: () => void;
}

export const MesaCard: React.FC<MesaCardProps> = ({
  fecha,
  materia,
  carrera,
  modalidad,
  color,
  onClick,
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
      </div>

      {/* Modalidad Badge */}
      <div className="flex items-center justify-end min-w-[100px]">
        <div className={`flex items-center gap-2 ${styles.bg} px-3 py-1 rounded-full`}>
          <div className={`w-3 h-3 rounded-full ${styles.dot}`} />
          <span className={`text-xs font-medium ${styles.text}`}>{modalidad}</span>
        </div>
      </div>

    </div>
  );
};

export default MesaCard;
