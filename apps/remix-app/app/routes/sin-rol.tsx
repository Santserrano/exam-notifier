import React from "react";

//pequeña ruta de error para cuando no hay rol (por las dudas)
export default function SinRolPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded bg-white p-8 text-center shadow">
        <h1 className="mb-4 text-2xl font-bold text-red-600">
          Sin rol asignado
        </h1>
        <p className="mb-2 text-gray-700">
          Tu cuenta no tiene un rol asignado.
        </p>
        <p className="text-gray-500">
          Por favor, contacta al administrador para que te asigne un rol.
        </p>
      </div>
    </div>
  );
}
