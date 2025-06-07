import React, { useState } from "react";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Link,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
  useFetcher,
} from "@remix-run/react";

import { Button } from "@exam-notifier/ui/components/button";
import Input from "@exam-notifier/ui/components/input";
import { MesaCardAdmin } from "@exam-notifier/ui/components/MesaCardAdmin";
import Modal from "@exam-notifier/ui/components/Modal";
import { SearchBar } from "@exam-notifier/ui/components/SearchBar";

import { clerkClient } from "~/utils/clerk.server";
import HeaderClerk from "../components/HeaderClerk";
import { getServerEnv } from "~/utils/env.server";
import { getNotificationConfig } from "~/utils/notification.server";
type Modalidad = "Virtual" | "Presencial";

interface Materia {
  id: string;
  nombre: string;
}

interface Carrera {
  id: string;
  nombre: string;
}

interface MesaRaw {
  id: string | number;
  fecha: string;
  modalidad?: string;
  materia?: {
    id?: string;
    nombre?: string;
    carrera?: {
      id?: string;
      nombre?: string;
    };
  } | string;
  carrera?: {
    id?: string;
    nombre?: string;
  } | string;
  sede?: string;
  profesor?: {
    id?: string;
    nombre?: string;
    apellido?: string;
  } | string;
  vocal?: {
    id?: string;
    nombre?: string;
    apellido?: string;
  } | string;
  aula?: string;
  hora?: string;
  webexLink?: string;
  descripcion?: string;
  cargo?: string;
  verification?: boolean;
}

interface MesaProcesada {
  id: string;
  materia: string;
  carrera: string;
  fecha: string;
  fechaOriginal: string;
  futura: boolean;
  modalidad: "Presencial" | "Virtual";
  color: string;
  sede: string;
  profesorNombre: string;
  vocalNombre: string;
  aula: string;
  hora?: string;
  webexLink?: string;
  descripcion?: string;
  cargo?: string;
  verification?: boolean;
}

interface Profesor {
  id: string;
  nombre: string;
  apellido: string;
  carreras: Carrera[];
  materias: Materia[];
}

type ActionData = {
  success?: boolean;
  data?: any;
  error?: string;
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

  const { API_URL, INTERNAL_API_KEY, VAPID_PUBLIC_KEY } = getServerEnv();
  const notificationConfig = await getNotificationConfig(args);

  try {
    // Obtener las mesas y profesores del backend
    const [mesasResponse, profesoresResponse, carrerasResponse] =
      await Promise.all([
        fetch(`${API_URL}/api/diaries/mesas`, {
          headers: {
            "x-api-key": INTERNAL_API_KEY,
            "Content-Type": "application/json",
          },
        }).catch((error: unknown) => {
          console.error("Error al obtener mesas:", error);
          return { ok: false, status: 500, json: () => [] };
        }),
        fetch(`${API_URL}/api/diaries/profesores`, {
          headers: {
            "x-api-key": INTERNAL_API_KEY,
            "Content-Type": "application/json",
          },
        }).catch((error: unknown) => {
          console.error("Error al obtener profesores:", error);
          return { ok: false, status: 500, json: () => [] };
        }),
        fetch(`${API_URL}/api/diaries/carreras`, {
          headers: {
            "x-api-key": INTERNAL_API_KEY,
            "Content-Type": "application/json",
          },
        }).catch((error: unknown) => {
          console.error("Error al obtener carreras:", error);
          return { ok: false, status: 500, json: () => [] };
        }),
      ]);

    const [mesas, profesores, carreras] = await Promise.all([
      mesasResponse.ok ? mesasResponse.json() : [],
      profesoresResponse.ok ? profesoresResponse.json() : [],
      carrerasResponse.ok ? carrerasResponse.json() : [],
    ]);

    const data = {
      userId,
      role,
      mesas: Array.isArray(mesas) ? mesas : [],
      profesores: Array.isArray(profesores) ? profesores : [],
      carreras: Array.isArray(carreras) ? carreras : [],
      notificationConfig,
      env: {
        VAPID_PUBLIC_KEY,
        API_URL,
        INTERNAL_API_KEY,
      },
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
      notificationConfig,
      env: {
        VAPID_PUBLIC_KEY,
        API_URL,
        INTERNAL_API_KEY,
      },
    });
  }
};

export const action = async (args: ActionFunctionArgs) => {
  const { request } = args;
  const { userId } = await getAuth(args);

  if (!userId) {
    return json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (role !== "admin") {
    return json({ error: "No autorizado" }, { status: 403 });
  }

  const { API_URL, INTERNAL_API_KEY } = getServerEnv();
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

  // Combinar fecha y hora correctamente
  const [year, month, day] = fecha.split('-').map(Number);
  const [hours, minutes] = hora.split(':').map(Number);
  
  // Crear la fecha en la zona horaria de Argentina
  const fechaLocal = new Date(year, month - 1, day, hours, minutes);
  
  // Enviar la fecha directamente sin convertir
  const fechaUTC = fechaLocal;

  try {
    const response = await fetch(`${API_URL}/api/diaries/mesas`, {
      method: "POST",
      headers: {
        "x-api-key": INTERNAL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profesor: profesorId,
        vocal: vocalId,
        carrera,
        materia,
        fecha: fechaUTC.toISOString(),
        descripcion: "Mesa de examen",
        cargo: "Titular",
        verification: false,
        modalidad,
        aula: modalidad === "Presencial" ? aula : undefined,
        webexLink: modalidad === "Virtual" ? webexLink : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json(
        { error: errorData.error || "Error al crear la mesa" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json({ success: true, data });
  } catch (error) {
    console.error("Error en el action:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Error al crear la mesa",
      },
      { status: 500 }
    );
  }
};

export default function AdminRoute() {
  const { userId, role, mesas, profesores, carreras, notificationConfig, env } =
    useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const [search, setSearch] = useState("");
  const [carrera, setCarrera] = useState("");
  const [materia, setMateria] = useState("");
  const [fecha, setFecha] = useState("");
  const [sede, setSede] = useState("");
  const [showAddMesa, setShowAddMesa] = useState(false);
  const [mesaAEditar, setMesaAEditar] = useState<MesaRaw | null>(null);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // Efecto para manejar la respuesta del action
  React.useEffect(() => {
    if (actionData?.success) {
      setShowAddMesa(false);
      setMesaAEditar(null);
      // Recargar la página para mostrar la nueva mesa
      window.location.reload();
    }
  }, [actionData]);

  const fechas = [
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
  const sedes = [
    "Corrientes",
    "Resistencia",
    "Posadas",
    "Formosa",
    "Paso de los Libres",
    "Curuzú Cuatiá",
    "Sáenz Peña",
    "Goya",
    "Leando N. Alem",
  ];
  const horas = ["08:00", "10:00", "12:00", "14:00", "16:00"];

  // Filtrar profesores según carrera y materia
  const profesoresFiltrados = React.useMemo(() => {
    if (!Array.isArray(profesores)) return [];

    return profesores.filter((profesor: Profesor) => {
      const cumpleCarrera =
        !carrera || profesor.carreras.some((c) => c.id === carrera);
      const cumpleMateria =
        !materia || profesor.materias.some((m) => m.id === materia);
      return cumpleCarrera && cumpleMateria;
    });
  }, [profesores, carrera, materia]);

  // Formatear las mesas para mostrarlas
  const mesasFormateadas = mesas.map((mesa: MesaRaw, index: number): MesaProcesada => {
    const fechaObj = new Date(mesa.fecha);
    const fechaFormateada = fechaObj.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      day: 'numeric',
      month: 'short'
    }).replace('.', '');
    const futura = fechaObj > new Date();
    const modalidad = (mesa.modalidad === "Virtual" ? "Virtual" : "Presencial") as "Presencial" | "Virtual";

    const materiaNombre = typeof mesa.materia === 'object' ? mesa.materia?.nombre || '' : mesa.materia || '';
    const carreraNombre = typeof mesa.carrera === 'object' 
      ? mesa.carrera?.nombre || mesa.carrera?.id || ''
      : mesa.carrera || '';
    
    const profesorObj = typeof mesa.profesor === 'object' ? mesa.profesor : null;
    const vocalObj = typeof mesa.vocal === 'object' ? mesa.vocal : null;

    return {
      id: mesa.id?.toString() || `mesa-${index}`,
      materia: materiaNombre,
      carrera: carreraNombre,
      fecha: fechaFormateada,
      fechaOriginal: mesa.fecha,
      futura,
      modalidad,
      color: modalidad === "Virtual" ? "blue" : "green",
      sede: mesa.sede || "Central",
      profesorNombre: profesorObj 
        ? `${profesorObj.nombre || ''} ${profesorObj.apellido || ''}`
        : typeof mesa.profesor === 'string' ? mesa.profesor : '',
      vocalNombre: vocalObj
        ? `${vocalObj.nombre || ''} ${vocalObj.apellido || ''}`
        : typeof mesa.vocal === 'string' ? mesa.vocal : '',
      aula: mesa.aula || "Aula por confirmar",
      hora: mesa.hora,
      webexLink: mesa.webexLink,
      descripcion: mesa.descripcion,
      cargo: mesa.cargo,
      verification: mesa.verification,
    };
  });

  // Filtro simple
  const mesasFiltradas = mesasFormateadas.filter(
    (m: MesaProcesada) =>
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
    mesa?: MesaRaw;
  }) {
    const isEdit = !!mesa;
    const fetcher = useFetcher();
    const isSubmitting = fetcher.state === "submitting";
    const [modalidad, setModalidad] = useState<Modalidad>(
      mesa?.modalidad === "Virtual" ? "Virtual" : "Presencial",
    );
    const [carreraSeleccionada, setCarreraSeleccionada] = useState<string>(
      typeof mesa?.carrera === 'object' ? mesa.carrera.id || '' : mesa?.carrera || '',
    );
    const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>(
      typeof mesa?.materia === 'object' ? mesa.materia.id || '' : mesa?.materia || '',
    );
    const [profesorSeleccionado, setProfesorSeleccionado] = useState<string>(
      typeof mesa?.profesor === 'object' ? mesa.profesor.id || '' : mesa?.profesor || '',
    );
    const [vocalSeleccionado, setVocalSeleccionado] = useState<string>(
      typeof mesa?.vocal === 'object' ? mesa.vocal.id || '' : mesa?.vocal || '',
    );
    const [aula, setAula] = useState(mesa?.aula ?? "");
    const [webexLink, setWebexLink] = useState(mesa?.webexLink ?? "");
    const [hora, setHora] = useState(mesa?.hora ?? "");

    // Función para formatear la fecha correctamente desde el string ISO
    const formatDate = (dateString: string) => {
      if (!dateString) return '';
      // Extraer solo la parte YYYY-MM-DD
      const match = dateString.match(/^\d{4}-\d{2}-\d{2}/);
      return match ? match[0] : '';
    };

    // Resetear materia cuando cambia la carrera
    React.useEffect(() => {
      if (!isEdit) {
        setMateriaSeleccionada("");
      }
    }, [carreraSeleccionada, isEdit]);

    // Actualizar valores cuando cambia la mesa
    React.useEffect(() => {
      if (mesa) {
        setModalidad(mesa.modalidad === "Virtual" ? "Virtual" : "Presencial");
        setCarreraSeleccionada(typeof mesa.carrera === 'object' ? mesa.carrera.id || '' : mesa.carrera || '');
        setMateriaSeleccionada(typeof mesa.materia === 'object' ? mesa.materia.id || '' : mesa.materia || '');
        setProfesorSeleccionado(typeof mesa.profesor === 'object' ? mesa.profesor.id || '' : mesa.profesor || '');
        setVocalSeleccionado(typeof mesa.vocal === 'object' ? mesa.vocal.id || '' : mesa.vocal || '');
        setAula(mesa.aula || "");
        setWebexLink(mesa.webexLink || "");
        setHora(mesa.hora || "");
        setFecha(mesa.fecha ? formatDate(mesa.fecha) : "");
      }
    }, [mesa]);

    // Filtrar profesores según carrera y materia seleccionada
    const profesoresFiltrados = React.useMemo(() => {
      if (!Array.isArray(profesores)) return [];

      return profesores.filter((profesor: Profesor) => {
        const cumpleCarrera =
          !carreraSeleccionada ||
          profesor.carreras.some((c) => c.id === carreraSeleccionada);
        const cumpleMateria =
          !materiaSeleccionada ||
          profesor.materias.some((m) => m.id === materiaSeleccionada);
        return cumpleCarrera && cumpleMateria;
      });
    }, [profesores, carreraSeleccionada, materiaSeleccionada]);

    if (!open) return null;

    return (
      <Modal open={open} onClose={onClose} title={""}>
        <fetcher.Form
          method="post"
          className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto pr-2"
        >
          <div className="sticky top-0 mb-2 flex items-center gap-2 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Volver"
              className="text-2xl text-green-900"
              disabled={isSubmitting}
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
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            disabled={isSubmitting}
          />
          <label className="text-sm font-semibold text-green-900">
            Carrera
          </label>
          <select
            name="carrera"
            className="rounded border px-2 py-2"
            required
            value={carreraSeleccionada}
            onChange={(e) => { setCarreraSeleccionada(e.target.value); }}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar</option>
            {/* Si la carrera seleccionada no está en la lista, agregarla */}
            {carreraSeleccionada && !carreras.some((c: Carrera) => c.id === carreraSeleccionada) && (
              <option value={carreraSeleccionada}>
                {carreraSeleccionada}
              </option>
            )}
            {carreras.map((c: Carrera) => (
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
            onChange={(e) => { setMateriaSeleccionada(e.target.value); }}
            disabled={!carreraSeleccionada || isSubmitting}
          >
            <option value="">Seleccionar</option>
            {/* Si la materia seleccionada no está en la lista, agregarla */}
            {materiaSeleccionada && carreraSeleccionada &&
              !carreras.find((c: Carrera) => c.id === carreraSeleccionada)?.materias?.some((m: { id: string }) => m.id === materiaSeleccionada) && (
                <option value={materiaSeleccionada}>{materiaSeleccionada}</option>
            )}
            {carreraSeleccionada &&
              carreras
                .find((c: Carrera) => c.id === carreraSeleccionada)
                ?.materias?.map((m: { id: string; nombre: string }) => (
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
            value={profesorSeleccionado}
            onChange={e => setProfesorSeleccionado(e.target.value)}
            disabled={!materiaSeleccionada || isSubmitting}
          >
            <option value="">Seleccionar</option>
            {/* Si el profesor seleccionado no está en la lista, agregarlo */}
            {profesorSeleccionado && !profesoresFiltrados.some((p: Profesor) => p.id === profesorSeleccionado) && (
              <option value={profesorSeleccionado}>{profesorSeleccionado}</option>
            )}
            {profesoresFiltrados.map((profesor: Profesor) => (
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
            value={vocalSeleccionado}
            onChange={e => setVocalSeleccionado(e.target.value)}
            disabled={!materiaSeleccionada || isSubmitting}
          >
            <option value="">Seleccionar</option>
            {/* Si el vocal seleccionado no está en la lista, agregarlo */}
            {vocalSeleccionado && !profesoresFiltrados.some((p: Profesor) => p.id === vocalSeleccionado) && (
              <option value={vocalSeleccionado}>{vocalSeleccionado}</option>
            )}
            {profesoresFiltrados.map((profesor: Profesor) => (
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
            value={hora}
            onChange={e => setHora(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="">Seleccionar</option>
            {/* Si la hora seleccionada no está en la lista, agregarla */}
            {hora && !horas.includes(hora) && (
              <option value={hora}>{hora}</option>
            )}
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
                onChange={() => { setModalidad("Presencial"); }}
                disabled={isSubmitting}
              />
              Presencial
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="modalidad"
                value="Virtual"
                checked={modalidad === "Virtual"}
                onChange={() => { setModalidad("Virtual"); }}
                disabled={isSubmitting}
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
                onChange={(e) => { setAula(e.target.value); }}
                placeholder="Ej: 101, Laboratorio 2"
                disabled={isSubmitting}
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
                onChange={(e) => { setWebexLink(e.target.value); }}
                placeholder="https://webex.com/..."
                disabled={isSubmitting}
              />
            </div>
          )}

          <Button
            type="submit"
            className="mt-2 flex w-full items-center justify-center gap-2 bg-green-700 text-white"
            disabled={isSubmitting}
          >
            {isEdit ? "Guardar Cambios" : "Añadir Mesa"}
          </Button>
        </fetcher.Form>
      </Modal>
    );
  }

  return (
    <div className="mx-auto max-w-md pb-8">
      <HeaderClerk notificationConfig={notificationConfig} userRole="admin" env={env} />
      <div className="mt-2 px-4">
        {actionData?.error && (
          <div className="mb-4 rounded bg-red-100 p-2 text-sm text-red-600">
            {actionData.error}
          </div>
        )}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-center text-base md:text-lg font-bold">
            Administración
          </h2>
          <Link to="/profesores" prefetch="intent">
            <Button variant="outline">Gestionar Profesores</Button>
          </Link>
        </div>
        <SearchBar
          searchValue={search}
          onSearchChange={setSearch}
          onAddMesa={() => { setShowAddMesa(true); }}
          carreras={carreras.map((c: Carrera) => c.nombre)}
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
        {showAddMesa && (
          <MesaModal 
            open={showAddMesa} 
            onClose={() => { setShowAddMesa(false); }} 
          />
        )}
        {mesaAEditar && (
          <MesaModal
            open={true}
            onClose={() => { setMesaAEditar(null); }}
            mesa={mesaAEditar}
          />
        )}
        <div>
          {mesasFiltradas.map((mesa: MesaProcesada) => (
            <MesaCardAdmin
              key={mesa.id}
              {...mesa}
              onClick={() => { setMesaAEditar(mesa as MesaRaw); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return <div>Error: {error instanceof Error ? error.message : "Unknown error"}</div>;
} 
