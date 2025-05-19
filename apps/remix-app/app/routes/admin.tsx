import React, { useState } from "react";
import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData } from "@remix-run/react";

import { Button } from "@exam-notifier/ui/components/button";
import Input from "@exam-notifier/ui/components/input";
import { MesaCard } from "@exam-notifier/ui/components/MesaCard";
import Modal from "@exam-notifier/ui/components/Modal";
import { SearchBar } from "@exam-notifier/ui/components/SearchBar";

import { clerkClient } from "~/utils/clerk.server";
import HeaderClerk from "../components/HeaderClerk";

type Modalidad = "Virtual" | "Presencial";

interface Mesa {
  id: number;
  profesor: string;
  vocal: string;
  carrera: string;
  materia: string;
  fecha: string;
  descripcion: string;
  cargo: string;
  verification: boolean;
  modalidad?: Modalidad;
  color?: string;
  hora?: string;
}

interface MesaFormateada extends Mesa {
  fecha: string;
  modalidad: Modalidad;
  color: string;
}

interface Profesor {
  id: string;
  nombre: string;
  apellido: string;
  carreras: string[];
  materias: string[];
}

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (role !== "admin") {
    return redirect("/");
  }

  try {
    // Obtener las mesas del backend
    const [mesasResponse, profesoresResponse] = await Promise.all([
      fetch("http://localhost:3001/api/diaries/mesas", {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
          "Content-Type": "application/json"
        }
      }).catch(error => {
        console.error("Error al obtener mesas:", error);
        return { ok: false, status: 500, json: () => [] };
      }),
      fetch("http://localhost:3001/api/diaries/profesores", {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
          "Content-Type": "application/json"
        }
      }).catch(error => {
        console.error("Error al obtener profesores:", error);
        return { ok: false, status: 500, json: () => [] };
      })
    ]);

    const [mesas, profesores] = await Promise.all([
      mesasResponse.ok ? mesasResponse.json() : [],
      profesoresResponse.ok ? profesoresResponse.json() : []
    ]);

    const data = {
      userId,
      role,
      mesas: Array.isArray(mesas) ? mesas : [],
      profesores: Array.isArray(profesores) ? profesores : []
    };

    return json(data);
  } catch (error) {
    console.error("Error en el loader:", error);
    return json({
      userId,
      role,
      mesas: [],
      profesores: []
    });
  }
};

export const action = async (args: ActionFunctionArgs) => {
  const { request } = args;
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (role !== "admin") {
    return redirect("/");
  }

  const formData = await request.formData();
  const fecha = formData.get("fecha") as string;
  const materia = formData.get("asignatura") as string;
  const carrera = formData.get("carrera") as string;
  const profesorId = formData.get("docenteTitular") as string;
  const vocalId = formData.get("docenteVocal") as string;
  const modalidad = formData.get("modalidad") as Modalidad;
  const hora = formData.get("hora") as string;

  // Combinar fecha y hora
  const fechaHora = new Date(`${fecha}T${hora}`);

  try {
    const response = await fetch("http://localhost:3001/api/diaries/mesas", {
      method: "POST",
      headers: {
        "x-api-key": process.env.INTERNAL_API_KEY || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        profesor: profesorId,
        vocal: vocalId,
        carrera,
        materia,
        fecha: fechaHora,
        descripcion: "Mesa de examen",
        cargo: "Titular",
        verification: true,
        modalidad
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al crear la mesa");
    }

    return redirect("/admin");
  } catch (error) {
    console.error("Error en el action:", error);
    return json({ error: error instanceof Error ? error.message : "Error al crear la mesa" }, { status: 400 });
  }
};

export default function AdminRoute() {
  const { userId, role, mesas, profesores } = useLoaderData<typeof loader>();
  console.log('Profesores cargados:', profesores);
  const actionData = useActionData<typeof action>();
  const [search, setSearch] = useState("");
  const [carrera, setCarrera] = useState("");
  const [fecha, setFecha] = useState("");
  const [sede, setSede] = useState("");
  const [showAddMesa, setShowAddMesa] = useState(false);
  const [mesaAEditar, setMesaAEditar] = useState<Mesa | null>(null);

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

  // Formatear las mesas para mostrarlas
  const mesasFormateadas = mesas.map((mesa: Mesa): MesaFormateada => {
    const fechaObj = new Date(mesa.fecha);
    const meses = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
    return {
      ...mesa,
      fecha: `${fechaObj.getDate()} ${meses[fechaObj.getMonth()]}`,
      modalidad: (mesa.modalidad || "Presencial") as Modalidad,
      color: mesa.modalidad === "Virtual" ? "blue" : "green"
    };
  });

  // Filtro simple
  const mesasFiltradas = mesasFormateadas.filter(
    (m: MesaFormateada) =>
      (!search || m.materia.toLowerCase().includes(search.toLowerCase())) &&
      (!carrera || m.carrera === carrera) &&
      (!fecha || m.fecha.includes(fecha))
  );

  function MesaModal({
    open,
    onClose,
    mesa,
  }: {
    open: boolean;
    onClose: () => void;
    mesa?: Mesa;
  }) {
    const isEdit = !!mesa;
    const [modalidad, setModalidad] = useState<Modalidad>(mesa?.modalidad || "Presencial");
    console.log('Profesores en MesaModal:', profesores); // Debug

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
            <h2 className="flex-1 text-center text-xl font-bold">
              {isEdit ? "Editar mesa" : "Agregar mesa"}
            </h2>
          </div>
          {actionData?.error && (
            <div className="rounded bg-red-100 p-2 text-sm text-red-600">
              {actionData.error}
            </div>
          )}
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
            defaultValue={mesa?.profesor || ""}
          >
            <option value="">Seleccionar</option>
            {Array.isArray(profesores) && profesores.map((profesor: Profesor) => (
              <option key={profesor.id} value={profesor.id}>
                {`${profesor.nombre} ${profesor.apellido}`}
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
            defaultValue={mesa?.vocal || ""}
          >
            <option value="">Seleccionar</option>
            {Array.isArray(profesores) && profesores.map((profesor: Profesor) => (
              <option key={profesor.id} value={profesor.id}>
                {`${profesor.nombre} ${profesor.apellido}`}
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
        {mesaAEditar && (
          <MesaModal
            open={true}
            onClose={() => setMesaAEditar(null)}
            mesa={mesaAEditar}
          />
        )}
        <h2 className="my-2 text-center text-lg font-bold">
          Mesas - Editar
        </h2>
        <div>
          {mesasFiltradas.map((mesa: MesaFormateada) => (
            <MesaCard
              key={mesa.id}
              {...mesa}
              onClick={() => setMesaAEditar(mesa)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
