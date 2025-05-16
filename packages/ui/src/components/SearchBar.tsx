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
        {/* Ícono de lupa */}
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>
        {/* Campo de búsqueda estilizado */}
        <Input
          type="text"
          placeholder="Buscar mesa"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-10 h-10 w-full rounded-full border border-gray-300 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 justify-items-center items-center">
      <div className="relative w-full">
        <select
          value={carreraSeleccionada}
          onChange={e => onCarreraChange(e.target.value)}
          className="bg-white border border-gray-300 rounded-full h-8 pl-6 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none"
        >
          <option value="">Carrera</option>
          {carreras.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div className="relative w-full">
        <select
          value={fechaSeleccionada}
          onChange={e => onFechaChange(e.target.value)}
          className="bg-white border border-gray-300 rounded-full h-8 pl-6 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none"
        >
          <option value="">Fecha</option>
          {fechas.map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      <div className="relative w-full">
        <select
          value={sedeSeleccionada}
          onChange={e => onSedeChange(e.target.value)}
          className="bg-white border border-gray-300 rounded-full h-8 pl-6 pr-8 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none"
        >
          <option value="">Sede</option>
          {sedes.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
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
