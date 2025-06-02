import React, { useState } from "react";
import { getAuth } from "@clerk/remix/ssr.server";
import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useActionData, Link, useNavigation } from "@remix-run/react";
import type { SerializeFrom } from "@remix-run/node";

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
  modalidad: Modalidad;
  color: string;
  hora: string;
  aula: string;
  webexLink: string;
}

interface MesaFormateada extends Mesa {
  fecha: string;
  modalidad: Modalidad;
  color: string;
}

interface Carrera {
  id: string;
  nombre: string;
  materias: { id: string; nombre: string; }[];
}

interface Materia {
  id: string;
  nombre: string;
  carreraId: string;
}

interface Profesor {
  id: string;
  nombre: string;
  apellido: string;
  carreras: { id: string; nombre: string; }[];
  materias: { id: string; nombre: string; carreraId: string; }[];
}

type MesaProcesada = {
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
  aula?: string;
  webexLink?: string;
};

type ProfesorProcesado = {
  id: string;
  nombre: string;
  apellido: string;
  carreras: { id: string; nombre: string; }[];
  materias: { id: string; nombre: string; carreraId: string; }[];
};

type CarreraProcesada = {
  id: string;
  nombre: string;
  materias: { id: string; nombre: string; }[];
};

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
    // Obtener las mesas y profesores del backend
    const [mesasResponse, profesoresResponse, carrerasResponse] = await Promise.all([
      fetch("http://localhost:3005/api/diaries/mesas", {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
          "Content-Type": "application/json"
        }
      }).catch((error: unknown) => {
        console.error("Error al obtener mesas:", error);
        return { ok: false, status: 500, json: () => [] };
      }),
      fetch("http://localhost:3005/api/diaries/profesores", {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
          "Content-Type": "application/json"
        }
      }).catch((error: unknown) => {
        console.error("Error al obtener profesores:", error);
        return { ok: false, status: 500, json: () => [] };
      }),
      fetch("http://localhost:3005/api/diaries/carreras", {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
          "Content-Type": "application/json"
        }
      }).catch((error: unknown) => {
        console.error("Error al obtener carreras:", error);
        return { ok: false, status: 500, json: () => [] };
      })
    ]);

    const [mesasRaw, profesores, carreras] = await Promise.all([
      mesasResponse.ok ? mesasResponse.json() : [],
      profesoresResponse.ok ? profesoresResponse.json() : [],
      carrerasResponse.ok ? carrerasResponse.json() : []
    ]);

    console.log('Mesas raw del backend:', mesasRaw);

    const meses = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
    const mesas = mesasRaw.map((m: {
      id?: number;
      materia?: { nombre: string; carrera?: { nombre: string; id: string } } | string;
      carrera?: { nombre: string; id: string } | string;
      fecha: string;
      modalidad?: Modalidad;
      sede?: string;
      profesor?: { nombre: string; apellido: string } | string;
      vocal?: { nombre: string; apellido: string } | string;
      aula?: string;
      webexLink?: string;
    }, index: number) => {
      const fechaObj = new Date(m.fecha);
      const fechaFormateada = `${fechaObj.getDate()} ${meses[fechaObj.getMonth()]}`;
      const modalidad = m.modalidad || "Presencial";
      
      const materiaNombre = typeof m.materia === 'string' ? m.materia : m.materia?.nombre || '';
      const carreraNombre = typeof m.carrera === 'string' ? m.carrera : m.carrera?.nombre || m.carrera?.id || '';
      const materiaCarreraNombre = typeof m.materia === 'object' && m.materia?.carrera?.nombre ? m.materia.carrera.nombre : '';
      
      return {
        id: m.id || `mesa-${index}`,
        materia: materiaNombre,
        carrera: materiaCarreraNombre || carreraNombre,
        fecha: fechaFormateada,
        fechaOriginal: m.fecha,
        modalidad,
        color: modalidad === "Virtual" ? "blue" : "green",
        sede: m.sede || "Central",
        profesorNombre: typeof m.profesor === 'string' ? m.profesor : m.profesor?.nombre ? `${m.profesor.nombre} ${m.profesor.apellido}` : '',
        vocalNombre: typeof m.vocal === 'string' ? m.vocal : m.vocal?.nombre ? `${m.vocal.nombre} ${m.vocal.apellido}` : '',
        aula: m.aula || "Aula por confirmar",
        webexLink: m.webexLink
      };
    });

    const profesoresProcesados = Array.isArray(profesores) ? profesores.map((profesor: { 
      id: string; 
      nombre: string; 
      apellido: string; 
      carreras?: Array<{ id: string; nombre: string }>; 
      materias?: Array<{ id: string; nombre: string; carreraId: string }> 
    }) => ({
      id: profesor.id,
      nombre: profesor.nombre,
      apellido: profesor.apellido,
      carreras: Array.isArray(profesor.carreras) ? profesor.carreras.map((c: { id: string; nombre: string }) => ({
        id: c.id,
        nombre: c.nombre
      })) : [],
      materias: Array.isArray(profesor.materias) ? profesor.materias.map((m: { id: string; nombre: string; carreraId: string }) => ({
        id: m.id,
        nombre: m.nombre,
        carreraId: m.carreraId
      })) : []
    })) : [];

    const carrerasProcesadas = Array.isArray(carreras) ? carreras.map((carrera: { id: string; nombre: string; materias?: Array<{ id: string; nombre: string }> }) => ({
      id: carrera.id,
      nombre: carrera.nombre,
      materias: Array.isArray(carrera.materias) ? carrera.materias.map((m: { id: string; nombre: string }) => ({
        id: m.id,
        nombre: m.nombre
      })) : []
    })) : [];

    const data = {
      userId,
      role,
      mesas,
      profesores: profesoresProcesados as SerializeFrom<ProfesorProcesado>[],
      carreras: carrerasProcesadas as SerializeFrom<CarreraProcesada>[],
      env: {
        INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      }
    };

    return json(data);
  } catch (error) {
    console.error("Error en el loader:", error);
    return json({
      userId,
      role,
      mesas: [],
      profesores: [],
      carreras: [],
      env: {
        INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      }
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
  const aula = formData.get("aula") as string;
  const webexLink = formData.get("webexLink") as string;

  // Combinar fecha y hora
  const fechaHora = new Date(`${fecha}T${hora}`);

  try {
    const response = await fetch("http://localhost:3005/api/diaries/mesas", {
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
        modalidad,
        aula: modalidad === "Presencial" ? aula : undefined,
        webexLink: modalidad === "Virtual" ? webexLink : undefined
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
  const { userId, role, mesas, profesores, carreras } = useLoaderData<typeof loader>();
  console.log('Profesores cargados:', profesores);
  const actionData = useActionData<typeof action>();
  const [search, setSearch] = useState("");
  const [carrera, setCarrera] = useState("");
  const [materia, setMateria] = useState("");
  const [fecha, setFecha] = useState("");
  const [sede, setSede] = useState("");
  const [showAddMesa, setShowAddMesa] = useState(false);
  const [mesaAEditar, setMesaAEditar] = useState<Mesa | null>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const fechas = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
  const sedes = ["Corrientes", "Resistencia", "Posadas", "Formosa", "Paso de los Libres", "Curuzú Cuatiá", "Sáenz Peña", "Goya", "Leando N. Alem"];
  const horas = ["08:00", "10:00", "12:00", "14:00", "16:00"];
  
  // Filtrar profesores según carrera y materia
  const profesoresFiltrados = React.useMemo(() => {
    if (!Array.isArray(profesores)) return [];
    
    return profesores.filter((profesor) => {
      const cumpleCarrera = !carrera || profesor.carreras.some((c: { id: string; nombre: string }) => c.id === carrera);
      const cumpleMateria = !materia || profesor.materias.some((m: { id: string; nombre: string; carreraId: string }) => m.id === materia);
      return cumpleCarrera && cumpleMateria;
    });
  }, [profesores, carrera, materia]);

  // Filtro simple
  const mesasFiltradas = mesas.filter(
    (m: Mesa) =>
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
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const [modalidad, setModalidad] = useState<Modalidad>(mesa?.modalidad || "Presencial");
    const [carreraSeleccionada, setCarreraSeleccionada] = useState(mesa?.carrera || "");
    const [materiaSeleccionada, setMateriaSeleccionada] = useState(mesa?.materia || "");
    const [aula, setAula] = useState(mesa?.aula || "");
    const [webexLink, setWebexLink] = useState(mesa?.webexLink || "");

    // Resetear materia cuando cambia la carrera
    React.useEffect(() => {
      setMateriaSeleccionada("");
    }, [carreraSeleccionada]);

    // Filtrar profesores según carrera y materia seleccionada
    const profesoresFiltrados = React.useMemo(() => {
      if (!Array.isArray(profesores)) return [];
      
      return profesores.filter((profesor) => {
        const cumpleCarrera = !carreraSeleccionada || profesor.carreras.some(c => c.id === carreraSeleccionada);
        const cumpleMateria = !materiaSeleccionada || profesor.materias.some(m => m.id === materiaSeleccionada);
        return cumpleCarrera && cumpleMateria;
      });
    }, [profesores, carreraSeleccionada, materiaSeleccionada]);

    return (
      <Modal open={open} onClose={onClose} title={""}>
        <form method="post" className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-2">
          <div className="mb-2 flex items-center gap-2 sticky top-0 bg-white pb-2">
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
            Carrera
          </label>
          <select
            name="carrera"
            className="rounded border px-2 py-2"
            required
            value={carreraSeleccionada}
            onChange={(e) => setCarreraSeleccionada(e.target.value)}
          >
            <option value="">Seleccionar</option>
            {carreras.map((c: CarreraProcesada) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <label className="text-sm font-semibold text-green-900">
            Asignatura
          </label>
          <select
            name="asignatura"
            className="rounded border px-2 py-2"
            required
            value={materiaSeleccionada}
            onChange={(e) => setMateriaSeleccionada(e.target.value)}
            disabled={!carreraSeleccionada}
          >
            <option value="">Seleccionar</option>
            {carreraSeleccionada && carreras
              .find((c: CarreraProcesada) => c.id === carreraSeleccionada)
              ?.materias.map((m: { id: string; nombre: string }) => (
                <option key={m.id} value={m.id}>
                  {m.nombre}
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
            disabled={!materiaSeleccionada}
          >
            <option value="">Seleccionar</option>
            {profesoresFiltrados.map((profesor) => (
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
            disabled={!materiaSeleccionada}
          >
            <option value="">Seleccionar</option>
            {profesoresFiltrados.map((profesor) => (
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

          {modalidad === "Presencial" ? (
            <div>
              <label className="text-sm font-semibold text-green-900">
                Aula
              </label>
              <Input
                type="text"
                name="aula"
                required
                value={aula}
                onChange={(e) => setAula(e.target.value)}
                placeholder="Ej: 101, Laboratorio 2"
              />
            </div>
          ) : (
            <div>
              <label className="text-sm font-semibold text-green-900">
                Link de Webex
              </label>
              <Input
                type="url"
                name="webexLink"
                required
                value={webexLink}
                onChange={(e) => setWebexLink(e.target.value)}
                placeholder="https://webex.com/..."
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="mt-2 w-full bg-green-700 text-white flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEdit ? "Guardando..." : "Creando..."}
              </>
            ) : (
              isEdit ? "Guardar Cambios" : "Añadir Mesa"
            )}
          </Button>
        </form>
      </Modal>
    );
  }

  return (
    <div className="mx-auto max-w-md pb-8">
      <HeaderClerk />
      <div className="mt-2 px-4">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-center text-lg font-bold">
            Mesas - Administración
          </h2>
          <Link to="/profesores">
            <Button variant="outline">
              Gestionar Profesores
            </Button>
          </Link>
        </div>
        <SearchBar
          searchValue={search}
          onSearchChange={setSearch}
          onAddMesa={() => setShowAddMesa(true)}
          carreras={carreras.map((c: { id: string; nombre: string; materias: { id: string; nombre: string; }[] }) => c.nombre)}
          carreraSeleccionada={carrera}
          onCarreraChange={setCarrera}
          fechas={fechas}
          fechaSeleccionada={fecha}
          onFechaChange={setFecha}
          sedes={sedes}
          sedeSeleccionada={sede}
          onSedeChange={setSede}
        />
        <style>{`
          select { max-height: 200px; overflow-y: auto; }
        `}</style>
        <MesaModal open={showAddMesa} onClose={() => setShowAddMesa(false)} />
        {mesaAEditar && (
          <MesaModal
            open={true}
            onClose={() => setMesaAEditar(null)}
            mesa={mesaAEditar}
          />
        )}
        <div className="space-y-4 rounded-3xl">
          {mesasFiltradas.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No hay mesas para mostrar.</div>
          ) : (
            mesasFiltradas.map((mesa: Mesa) => (
              <MesaCard
                key={mesa.id}
                fecha={mesa.fecha}
                materia={mesa.materia}
                carrera={mesa.carrera}
                modalidad={mesa.modalidad}
                color={mesa.color}
                onClick={() => setMesaAEditar(mesa)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
