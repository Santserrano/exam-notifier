import React from "react";

export interface HeaderProps {
  onLogout?: () => void;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ onLogout, logoUrl }) => (
  <header className="flex items-center justify-between p-4 border-b bg-white">
    <button
      className="text-sm font-semibold"
      onClick={onLogout}
      aria-label="Cerrar sesión"
    >
      Cerrar sesión
    </button>
    {logoUrl ? (
      <img src={logoUrl} alt="Logo" className="h-8 w-8" />
    ) : (
      <span className="inline-block h-8 w-8 bg-gray-200 rounded-full" />
    )}
  </header>
);

export default Header; 