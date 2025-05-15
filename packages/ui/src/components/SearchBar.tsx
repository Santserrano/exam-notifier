import React from "react";

import Input from "./input";

export interface SearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onAddMesa?: () => void;
  showAddMesaButton?: boolean;
  carreras: string[];
  carreraSeleccionada: string;
  onCarreraChange: (value: string) => void;
  fechas: string[];
  fechaSeleccionada: string;
  onFechaChange: (value: string) => void;
  sedes: string[];
  sedeSeleccionada: string;
  onSedeChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchValue,
  onSearchChange,
  onAddMesa,
  showAddMesaButton = true,
  carreras,
  carreraSeleccionada,
  onCarreraChange,
  fechas,
  fechaSeleccionada,
  onFechaChange,
  sedes,
  sedeSeleccionada,
  onSedeChange,
}) => (
  <div className="flex flex-col gap-2 p-2">
    <div className="mb-2 w-full">
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Buscar"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10 h-10"
        />
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 justify-items-center items-center">
      <select
        value={carreraSeleccionada}
        onChange={e => onCarreraChange(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      >
        <option value="">Carrera</option>
        {carreras.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        value={fechaSeleccionada}
        onChange={e => onFechaChange(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      >
        <option value="">Fecha</option>
        {fechas.map(f => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <select
        value={sedeSeleccionada}
        onChange={e => onSedeChange(e.target.value)}
        className="border rounded px-2 py-1 w-full"
      >
        <option value="">Sede</option>
        {sedes.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
    {showAddMesaButton && onAddMesa && (
      <button
        onClick={onAddMesa}
        className="bg-green-700 text-white rounded px-4 py-1 font-semibold hover:bg-green-800 transition mt-2"
      >
        Agregar Mesa
      </button>
    )}
  </div>
);

export default SearchBar; 