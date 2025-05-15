import React, { useState } from "react";
import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Button } from "@exam-notifier/ui/components/button";
import Input from "@exam-notifier/ui/components/input";
import { MesaCard } from "@exam-notifier/ui/components/MesaCard";
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

  // Verificar si el usuario es administrador
  if (role !== "admin") {
    return redirect("/"); // Si no es admin, protejo la ruta
  }

  return json({
    userId,
    role,
  });
};

// Mock de mesas - deberíamos de llamar a la API de mesas :P
const MOCK_MESAS = [
  {
    fecha: "5 mar.",
    materia: "Base de datos",
    carrera: "Ingeniería en sistemas",
    modalidad: "Presencial" as const,
    color: "green",
  },
  {
    fecha: "15 mar.",
    materia: "Paradigmas 3",
    carrera: "Ingeniería en sistemas",
    modalidad: "Virtual" as const,
    color: "blue",
  },
  {
    fecha: "22 mar.",
    materia: "Redes",
    carrera: "Ingeniería en sistemas",
    modalidad: "Presencial" as const,
    color: "green",
  },
  {
    fecha: "2 Abr.",
    materia: "Ing. Software 3",
    carrera: "Ingeniería en sistemas",
    modalidad: "Virtual" as const,
    color: "blue",
  },
  {
    fecha: "5 abr.",
    materia: "Mat. discreta",
    carrera: "Arquitectura",
    modalidad: "Presencial" as const,
    color: "green",
  },
];

export default function AdminRoute() {
  const { userId, role } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const [carrera, setCarrera] = useState("");
  const [fecha, setFecha] = useState("");
  const [sede, setSede] = useState("");
  const [showAddMesa, setShowAddMesa] = useState(false);
  const [mesaAEditar, setMesaAEditar] = useState<any | null>(null);

  // Mock de carreras y fechas
  const carreras = ["Ingeniería en sistemas", "Arquitectura"];
  const fechas = ["mar.", "abr."];
  const sedes = ["Central", "Virtual", "Sur"];
  const asignaturas = [
    "Base de datos",
    "Paradigmas 3",
    "Redes",
    "Ing. Software 3",
    "Mat. discreta",
  ];
  const docentes = ["Juan Pérez", "Ana Gómez", "Carlos Ruiz", "María López"];
  const horas = ["08:00", "10:00", "12:00", "14:00", "16:00"];

  // Filtro simple
  const mesasFiltradas = MOCK_MESAS.filter(
    (m) =>
      (!search || m.materia.toLowerCase().includes(search.toLowerCase())) &&
      (!carrera || m.carrera === carrera) &&
      (!fecha || m.fecha.includes(fecha)),
  );

  function MesaModal({
    open,
    onClose,
    mesa,
  }: {
    open: boolean;
    onClose: () => void;
    mesa?: any;
  }) {
    const isEdit = !!mesa;
    const [modalidad, setModalidad] = useState(mesa?.modalidad || "Presencial");
    return (
      <Modal open={open} onClose={onClose} title={""}>
        <form method="post" className="flex flex-col gap-3">
          <div className="mb-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Volver"
              className="text-2xl text-green-900"
            >
              ←
            </button>
            <h2 className="flex-1 text-center text-xl font-bold text-green-900">
              {isEdit ? "Editar mesa" : "Agregar mesa"}
            </h2>
          </div>
          <label className="text-sm font-semibold text-green-900">Fecha</label>
          <Input
            type="date"
            name="fecha"
            required
            defaultValue={mesa?.fecha || ""}
          />
          <label className="text-sm font-semibold text-green-900">
            Asignatura
          </label>
          <select
            name="asignatura"
            className="rounded border px-2 py-2"
            required
            defaultValue={mesa?.materia || ""}
          >
            <option value="">Seleccionar</option>
            {asignaturas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <label className="text-sm font-semibold text-green-900">
            Carrera
          </label>
          <select
            name="carrera"
            className="rounded border px-2 py-2"
            required
            defaultValue={mesa?.carrera || ""}
          >
            <option value="">Seleccionar</option>
            {carreras.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <label className="text-sm font-semibold text-green-900">
            Docente Titular
          </label>
          <select
            name="docenteTitular"
            className="rounded border px-2 py-2"
            required
            defaultValue={mesa?.docenteTitular || ""}
          >
            <option value="">Seleccionar</option>
            {docentes.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <label className="text-sm font-semibold text-green-900">
            Docente Vocal
          </label>
          <select
            name="docenteVocal"
            className="rounded border px-2 py-2"
            required
            defaultValue={mesa?.docenteVocal || ""}
          >
            <option value="">Seleccionar</option>
            {docentes.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <label className="text-sm font-semibold text-green-900">Sede</label>
          <select
            name="sede"
            className="rounded border px-2 py-2"
            required
            defaultValue={mesa?.sede || ""}
          >
            <option value="">Seleccionar</option>
            {sedes.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <label className="text-sm font-semibold text-green-900">Hora</label>
          <select
            name="hora"
            className="rounded border px-2 py-2"
            required
            defaultValue={mesa?.hora || ""}
          >
            <option value="">Seleccionar</option>
            {horas.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <label className="text-sm font-semibold text-green-900">
            Modalidad
          </label>
          <div className="mb-2 flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="modalidad"
                value="Presencial"
                checked={modalidad === "Presencial"}
                onChange={() => setModalidad("Presencial")}
              />
              Presencial
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="modalidad"
                value="Virtual"
                checked={modalidad === "Virtual"}
                onChange={() => setModalidad("Virtual")}
              />
              Virtual
            </label>
          </div>
          <Button type="submit" className="mt-2 w-full bg-green-700 text-white">
            {isEdit ? "Guardar Cambios" : "Añadir Mesa"}
          </Button>
        </form>
      </Modal>
    );
  }

  return (
    <div className="mx-auto max-w-md pb-8">
      <HeaderClerk />
      <div className="mt-2 px-4">
        <SearchBar
          searchValue={search}
          onSearchChange={setSearch}
          onAddMesa={() => setShowAddMesa(true)}
          carreras={carreras}
          carreraSeleccionada={carrera}
          onCarreraChange={setCarrera}
          fechas={fechas}
          fechaSeleccionada={fecha}
          onFechaChange={setFecha}
          sedes={sedes}
          sedeSeleccionada={sede}
          onSedeChange={setSede}
        />
        <MesaModal open={showAddMesa} onClose={() => setShowAddMesa(false)} />
        <MesaModal
          open={!!mesaAEditar}
          onClose={() => setMesaAEditar(null)}
          mesa={mesaAEditar}
        />
        <h2 className="my-4 text-center text-2xl font-bold text-green-900">
          Mesas - Editar
        </h2>
        <div>
          {mesasFiltradas.map((mesa, idx) => (
            <MesaCard
              key={idx}
              {...mesa}
              onClick={() => setMesaAEditar(mesa)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
