import React, { useState } from "react";
import { SignOutButton } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams, useNavigate } from "@remix-run/react";
import { Building2, Calendar, Clock, Info, MapPin, User, Bell, Settings } from "lucide-react";

import { Button } from "@exam-notifier/ui/components/button";
import MesaCard from "@exam-notifier/ui/components/MesaCard";
import Modal from "@exam-notifier/ui/components/Modal";
import { SearchBar } from "@exam-notifier/ui/components/SearchBar";

import { clerkClient } from "~/utils/clerk.server";
import HeaderClerk from "../components/HeaderClerk";

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);
  
  if (!userId) {
    return redirect("/sign-in");
  }

  // Obtener el usuario desde Clerk
  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  // Verificar si el usuario es profesor
  if (role !== "profesor") {
    return redirect("/");
  }

  // Consumir el backend Express
  const response = await fetch("http://localhost:3001/api/diaries");
  const mesasRaw = await response.json();

  // Formatear la fecha
  const mesas = mesasRaw.map((m: any, index: number) => {
    const fechaObj = new Date(m.fecha);
    const meses = [
      "ene.",
      "feb.",
      "mar.",
      "abr.",
      "may.",
      "jun.",
      "jul.",
      "ago.",
      "sep.",
      "oct.",
      "nov.",
      "dic.",
    ];
    const fechaFormateada = `${fechaObj.getDate()} ${meses[fechaObj.getMonth()]}`;
    const ahora = new Date();
    const futura = fechaObj > ahora;

    return {
      id: m.id || `mesa-${index}`,
      ...m,
      fechaOriginal: m.fecha,
      fecha: fechaFormateada,
      futura,
      modalidad: "Presencial",
      color: "green",
      sede: "Central",
    };
  });

  return json({
    userId,
    role,
    mesas,
  });
};

const carreras = ["Ingeniería en sistemas", "Arquitectura"];
const fechas = ["mar.", "abr."];
const sedes = ["Central", "Virtual", "Sur"];

export default function MesasRoute() {
  const { userId, role, mesas } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const [carrera, setCarrera] = useState("");
  const [fecha, setFecha] = useState("");
  const [sede, setSede] = useState("");
  const [filtroAlumno, setFiltroAlumno] = useState("");
  const alumnosMock = [
    { nombre: "Juan Pérez" },
    { nombre: "Ana Gómez" },
    { nombre: "Carlos Ruiz" },
    { nombre: "María López" },
    { nombre: "Gilda R. Romero" },
  ];
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const detalleId = searchParams.get("detalle");
  const alumnosId = searchParams.get("alumnos");

  const mesasFiltradas = mesas.filter((m: any) => {
    const fechaMesa = new Date(m.fechaOriginal);
    const ahora = new Date();
    const futura = fechaMesa > ahora;
    return (
      (searchParams.get("tab") === "pasadas" ? !futura : futura) &&
      (!search || m.materia.toLowerCase().includes(search.toLowerCase())) &&
      (!carrera || m.carrera === carrera) &&
      (!fecha || m.fecha.includes(fecha)) &&
      (!sede || m.sede === sede)
    );
  });

  const mesaDetalle = mesas.find((m: any) => m.id?.toString() === detalleId || m.id?.toString() === alumnosId);

  function DetalleMesa({ mesa }: { mesa: any }) {
    return (
      <div className="flex min-w-[300px] flex-col gap-6 p-2">
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              searchParams.delete("detalle");
              setSearchParams(searchParams);
            }}
            aria-label="Volver"
            className="text-2xl text-green-900"
          >
            ←
          </button>
          <h2 className="flex-1 text-center text-xl font-bold text-green-900">
            Detalle de Mesa
          </h2>
        </div>
        <div className="text-lg font-semibold text-green-900">
          {mesa.materia}
        </div>
        <div className="mb-2 text-sm text-gray-500">{mesa.carrera}</div>
        <Button
          className="mb-2 w-full bg-blue-800 text-white"
          onClick={() => {
            searchParams.delete("detalle");
            searchParams.set("alumnos", mesa.id);
            setSearchParams(searchParams);
          }}
        >
          Alumnos inscriptos
        </Button>
        <hr className="my-2" />
        <div className="mb-1 flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-blue-800" /> Titular: Gilda R. Romero
        </div>
        <div className="mb-1 flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-blue-800" /> Vocal: Gilda R. Romero
        </div>
        <hr className="my-2" />
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-blue-800" /> Viernes 5 de Abril 2025
        </div>
        <hr className="my-2" />
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-blue-800" /> 08:00 hs
        </div>
        <div className="mb-1 flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-blue-800" /> {mesa.modalidad}
        </div>
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-blue-800" /> Aula 23
        </div>
        <hr className="my-2" />
        <div className="mb-1 flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-blue-800" /> Recibirás un recordatorio 1 día antes
        </div>
      </div>
    );
  }

  function ListaAlumnos({ mesa }: { mesa: any }) {
    const alumnosFiltrados = alumnosMock.filter((a) =>
      a.nombre.toLowerCase().includes(filtroAlumno.toLowerCase()),
    );
    return (
      <div className="flex min-w-[300px] flex-col gap-2 p-2">
        <div className="mb-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              searchParams.delete("alumnos");
              setSearchParams(searchParams);
            }}
            aria-label="Volver"
            className="text-2xl text-green-900"
          >
            ←
          </button>
          <h2 className="flex-1 text-center text-xl font-bold text-green-900">
            Alumnos inscriptos
          </h2>
        </div>
        <input
          type="text"
          placeholder="Buscar alumno por nombre"
          value={filtroAlumno}
          onChange={(e) => setFiltroAlumno(e.target.value)}
          className="mb-2 rounded border px-2 py-2"
        />
        <div className="flex flex-col gap-1">
          {alumnosFiltrados.length === 0 ? (
            <div className="text-center text-gray-500">
              No hay alumnos para mostrar.
            </div>
          ) : (
            alumnosFiltrados.map((a, idx) => (
              <div key={idx} className="rounded border bg-gray-50 px-3 py-2">
                {a.nombre}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Tabs control via query param
  const tab = searchParams.get("tab") === "pasadas" ? "pasadas" : "futuras";

  return (
    <div className="mx-auto max-w-md pb-8">
      <HeaderClerk />
      <div className="mt-2 px-4">
        <div className="mb-4">
          <SearchBar
            searchValue={search}
            onSearchChange={setSearch}
            carreras={carreras}
            carreraSeleccionada={carrera}
            onCarreraChange={setCarrera}
            fechas={fechas}
            fechaSeleccionada={fecha}
            onFechaChange={setFecha}
            sedes={sedes}
            sedeSeleccionada={sede}
            onSedeChange={setSede}
            showAddMesaButton={false}
          />
        </div>
        <h2 className="my-4 text-center text-2xl font-bold text-green-900">
          Mesas - Visualización
        </h2>
        <div>
          {detalleId && mesaDetalle ? (
            <DetalleMesa mesa={mesaDetalle} />
          ) : alumnosId && mesaDetalle ? (
            <ListaAlumnos mesa={mesaDetalle} />
          ) : (
            mesasFiltradas.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No hay mesas para mostrar.</div>
            ) : (
              mesasFiltradas.map((mesa: any) => (
                <MesaCard
                  key={mesa.id}
                  fecha={mesa.fecha}
                  materia={mesa.materia}
                  carrera={mesa.carrera}
                  modalidad={mesa.modalidad}
                  color={mesa.color}
                  onClick={() => {
                    searchParams.set("detalle", mesa.id);
                    setSearchParams(searchParams);
                  }}
                />
              ))
            )
          )}
        </div>
        <div className="w-full mt-4 px-2 text-xs text-center">
          <div className="text-red-600 mb-1">
            <span className="align-middle">¿Notás algún error en las mesas?</span>
          </div>
          <a href="#" className="text-blue-800 underline">Contactar a oficina de docentes</a>
        </div>
      </div>
    </div>
  );
} 
