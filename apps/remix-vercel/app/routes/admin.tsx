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

// Types
type Modalidad = "Virtual" | "Presencial";

interface Materia {
  id: string;
  nombre: string;
}

interface Carrera {
  id: string;
  nombre: string;
  materias?: Materia[];
}

interface Profesor {
  id: string;
  nombre: string;
  apellido: string;
  carreras: Carrera[];
  materias: Materia[];
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

type ActionData = {
  success?: boolean;
  data?: any;
  error?: string;
};

// Constants
const FECHAS = [
  "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
  "jul.", "ago.", "sep.", "oct.", "nov.", "dic.",
];

const SEDES = [
  "Corrientes", "Resistencia", "Posadas", "Formosa",
  "Paso de los Libres", "Curuzú Cuatiá", "Sáenz Peña",
  "Goya", "Leando N. Alem",
];

const HORAS = ["08:00", "10:00", "12:00", "14:00", "16:00"];

// Custom Hooks
const useMesaForm = (initialMesa?: MesaRaw) => {
  const [modalidad, setModalidad] = useState<Modalidad>("Presencial");
  const [carreraSeleccionada, setCarreraSeleccionada] = useState<string>("");
  const [materiaSeleccionada, setMateriaSeleccionada] = useState<string>("");
  const [profesorSeleccionado, setProfesorSeleccionado] = useState<string>("");
  const [vocalSeleccionado, setVocalSeleccionado] = useState<string>("");
  const [aula, setAula] = useState("");
  const [webexLink, setWebexLink] = useState("");
  const [hora, setHora] = useState("");
  const [fecha, setFecha] = useState("");

  React.useEffect(() => {
    if (initialMesa) {
      // Establecer modalidad
      setModalidad(initialMesa.modalidad === "Virtual" ? "Virtual" : "Presencial");
      
      // Establecer carrera
      const carreraId = typeof initialMesa.carrera === 'object' 
        ? initialMesa.carrera.id 
        : initialMesa.carrera;
      setCarreraSeleccionada(carreraId || '');
      
      // Establecer materia
      const materiaId = typeof initialMesa.materia === 'object' 
        ? initialMesa.materia.id 
        : initialMesa.materia;
      setMateriaSeleccionada(materiaId || '');
      
      // Establecer profesor
      const profesorId = typeof initialMesa.profesor === 'object' 
        ? initialMesa.profesor.id 
        : initialMesa.profesor;
      setProfesorSeleccionado(profesorId || '');
      
      // Establecer vocal
      const vocalId = typeof initialMesa.vocal === 'object' 
        ? initialMesa.vocal.id 
        : initialMesa.vocal;
      setVocalSeleccionado(vocalId || '');
      
      // Establecer aula y webexLink
      setAula(initialMesa.aula || "");
      setWebexLink(initialMesa.webexLink || "");
      
      // Establecer hora
      setHora(initialMesa.hora || "");
      
      // Establecer fecha
      if (initialMesa.fecha) {
        const fechaObj = new Date(initialMesa.fecha);
        const year = fechaObj.getFullYear();
        const month = String(fechaObj.getMonth() + 1).padStart(2, '0');
        const day = String(fechaObj.getDate()).padStart(2, '0');
        setFecha(`${year}-${month}-${day}`);
      }
    }
  }, [initialMesa]);

  const resetForm = () => {
    setModalidad("Presencial");
    setCarreraSeleccionada("");
    setMateriaSeleccionada("");
    setProfesorSeleccionado("");
    setVocalSeleccionado("");
    setAula("");
    setWebexLink("");
    setHora("");
    setFecha("");
  };

  return {
    formState: {
      modalidad,
      carreraSeleccionada,
      materiaSeleccionada,
      profesorSeleccionado,
      vocalSeleccionado,
      aula,
      webexLink,
      hora,
      fecha,
    },
    formActions: {
      setModalidad,
      setCarreraSeleccionada,
      setMateriaSeleccionada,
      setProfesorSeleccionado,
      setVocalSeleccionado,
      setAula,
      setWebexLink,
      setHora,
      setFecha,
      resetForm,
    },
  };
};

const useProfesoresFiltrados = (profesores: Profesor[], carreraId: string, materiaId: string) => {
  return React.useMemo(() => {
    if (!Array.isArray(profesores)) return [];

    return profesores.filter((profesor) => {
      const cumpleCarrera = !carreraId || profesor.carreras.some((c) => c.id === carreraId);
      const cumpleMateria = !materiaId || profesor.materias.some((m) => m.id === materiaId);
      return cumpleCarrera && cumpleMateria;
    });
  }, [profesores, carreraId, materiaId]);
};

// Helper Functions
const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const match = dateString.match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
};

const procesarMesa = (mesa: MesaRaw, index: number): MesaProcesada => {
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
};

// Components
const MesaModal = ({ open, onClose, mesa, profesores, carreras }: {
  open: boolean;
  onClose: () => void;
  mesa?: MesaRaw;
  profesores: Profesor[];
  carreras: Carrera[];
}) => {
  const isEdit = !!mesa;
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const actionData = useActionData<ActionData>();

  const { formState, formActions } = useMesaForm(mesa);
  const profesoresFiltrados = useProfesoresFiltrados(
    profesores,
    formState.carreraSeleccionada,
    formState.materiaSeleccionada
  );

  React.useEffect(() => {
    if ((fetcher.data as { success?: boolean })?.success) {
      formActions.resetForm();
      onClose();
      window.location.reload();
    }
  }, [fetcher.data]);

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title={""}>
      <fetcher.Form
        method="post"
        className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto pr-2"
      >
        {isEdit && mesa?.id && (
          <input type="hidden" name="mesaId" value={mesa.id} />
        )}
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

        <FormFields
          formState={formState}
          formActions={formActions}
          isSubmitting={isSubmitting}
          profesoresFiltrados={profesoresFiltrados}
          carreras={carreras}
        />

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
};

const FormFields = ({ formState, formActions, isSubmitting, profesoresFiltrados, carreras }: {
  formState: ReturnType<typeof useMesaForm>['formState'];
  formActions: ReturnType<typeof useMesaForm>['formActions'];
  isSubmitting: boolean;
  profesoresFiltrados: Profesor[];
  carreras: Carrera[];
}) => {
  return (
    <>
      <label className="text-sm font-semibold text-green-900">Fecha</label>
      <Input
        type="date"
        name="fecha"
        required
        value={formState.fecha}
        onChange={e => formActions.setFecha(e.target.value)}
        disabled={isSubmitting}
      />

      <label className="text-sm font-semibold text-green-900">Carrera</label>
      <select
        name="carrera"
        className="rounded border px-2 py-2"
        required
        value={formState.carreraSeleccionada}
        onChange={(e) => formActions.setCarreraSeleccionada(e.target.value)}
        disabled={isSubmitting}
      >
        <option value="">Seleccionar</option>
        {carreras.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>

      <label className="text-sm font-semibold text-green-900">Asignatura</label>
      <select
        name="asignatura"
        className="rounded border px-2 py-2"
        required
        value={formState.materiaSeleccionada}
        onChange={(e) => formActions.setMateriaSeleccionada(e.target.value)}
        disabled={!formState.carreraSeleccionada || isSubmitting}
      >
        <option value="">Seleccionar</option>
        {formState.carreraSeleccionada &&
          carreras
            .find((c) => c.id === formState.carreraSeleccionada)
            ?.materias?.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nombre}
              </option>
            ))}
      </select>

      <label className="text-sm font-semibold text-green-900">Docente Titular</label>
      <select
        name="docenteTitular"
        className="rounded border px-2 py-2"
        required
        value={formState.profesorSeleccionado}
        onChange={e => formActions.setProfesorSeleccionado(e.target.value)}
        disabled={!formState.materiaSeleccionada || isSubmitting}
      >
        <option value="">Seleccionar</option>
        {profesoresFiltrados.map((profesor) => (
          <option key={profesor.id} value={profesor.id}>
            {`${profesor.nombre} ${profesor.apellido}`}
          </option>
        ))}
      </select>

      <label className="text-sm font-semibold text-green-900">Docente Vocal</label>
      <select
        name="docenteVocal"
        className="rounded border px-2 py-2"
        required
        value={formState.vocalSeleccionado}
        onChange={e => formActions.setVocalSeleccionado(e.target.value)}
        disabled={!formState.materiaSeleccionada || isSubmitting}
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
        value={formState.hora}
        onChange={e => formActions.setHora(e.target.value)}
        disabled={isSubmitting}
      >
        <option value="">Seleccionar</option>
        {HORAS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <label className="text-sm font-semibold text-green-900">Modalidad</label>
      <div className="mb-2 flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="modalidad"
            value="Presencial"
            checked={formState.modalidad === "Presencial"}
            onChange={() => formActions.setModalidad("Presencial")}
            disabled={isSubmitting}
          />
          Presencial
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="modalidad"
            value="Virtual"
            checked={formState.modalidad === "Virtual"}
            onChange={() => formActions.setModalidad("Virtual")}
            disabled={isSubmitting}
          />
          Virtual
        </label>
      </div>

      {formState.modalidad === "Presencial" ? (
        <div>
          <label className="text-sm font-semibold text-green-900">Aula</label>
          <Input
            type="text"
            name="aula"
            required
            value={formState.aula}
            onChange={(e) => formActions.setAula(e.target.value)}
            placeholder="Ej: 101, Laboratorio 2"
            disabled={isSubmitting}
          />
        </div>
      ) : (
        <div>
          <label className="text-sm font-semibold text-green-900">Link de Webex</label>
          <Input
            type="url"
            name="webexLink"
            required
            value={formState.webexLink}
            onChange={(e) => formActions.setWebexLink(e.target.value)}
            placeholder="https://webex.com/..."
            disabled={isSubmitting}
          />
        </div>
      )}
    </>
  );
};

// Main Component
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
  const [isLoadingProfesores, setIsLoadingProfesores] = useState(false);

  const mesasFormateadas = React.useMemo(() => 
    mesas.map((mesa: MesaRaw, index: number) => procesarMesa(mesa, index)),
    [mesas]
  );

  const mesasFiltradas = React.useMemo(() => 
    mesasFormateadas.filter(
      (m: MesaProcesada) =>
        (!search || m.materia.toLowerCase().includes(search.toLowerCase())) &&
        (!carrera || m.carrera === carrera) &&
        (!fecha || m.fecha.includes(fecha))
    ),
    [mesasFormateadas, search, carrera, fecha]
  );

  const handleProfesoresClick = () => {
    setIsLoadingProfesores(true);
  };

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
          <Link 
            to="/profesores" 
            prefetch="render"
            onClick={handleProfesoresClick}
          >
            <Button 
              variant="outline" 
              disabled={isLoadingProfesores}
              className="relative"
            >
              {isLoadingProfesores ? (
                <>
                  <span className="opacity-0">Gestionar Profesores</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                </>
              ) : (
                "Gestionar Profesores"
              )}
            </Button>
          </Link>
        </div>
        <SearchBar
          searchValue={search}
          onSearchChange={setSearch}
          onAddMesa={() => setShowAddMesa(true)}
          carreras={carreras.map((c: Carrera) => c.nombre)}
          carreraSeleccionada={carrera}
          onCarreraChange={setCarrera}
          fechas={FECHAS}
          fechaSeleccionada={fecha}
          onFechaChange={setFecha}
          sedes={SEDES}
          sedeSeleccionada={sede}
          onSedeChange={setSede}
        />
        <style>{`
          select { max-height: 200px; overflow-y: auto; }
        `}</style>
        {showAddMesa && (
          <MesaModal 
            open={showAddMesa} 
            onClose={() => setShowAddMesa(false)}
            profesores={profesores}
            carreras={carreras}
          />
        )}
        {mesaAEditar && (
          <MesaModal
            open={true}
            onClose={() => setMesaAEditar(null)}
            mesa={mesaAEditar}
            profesores={profesores}
            carreras={carreras}
          />
        )}
        <div>
          {mesasFiltradas.map((mesa: MesaProcesada) => (
            <MesaCardAdmin
              key={mesa.id}
              {...mesa}
              onClick={() => {
                // Buscar la mesa original por ID y pasarla al modal
                const mesaRaw = mesas.find((m: MesaRaw) => m.id?.toString() === mesa.id);
                setMesaAEditar(mesaRaw || null);
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Loader and Action functions remain unchanged
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
    // Obtener las mesas, profesores, carreras y aceptaciones del backend
    const [mesasResponse, profesoresResponse, carrerasResponse, aceptacionesResponse] =
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
        fetch(`${API_URL}/api/diaries/mesas/aceptaciones`, {
          headers: {
            "x-api-key": INTERNAL_API_KEY,
            "Content-Type": "application/json",
          },
        }).catch((error: unknown) => {
          console.error("Error al obtener aceptaciones:", error);
          return { ok: false, status: 500, json: () => [] };
        }),
      ]);

    const [mesas, profesores, carreras, aceptaciones] = await Promise.all([
      mesasResponse.ok ? mesasResponse.json() : [],
      profesoresResponse.ok ? profesoresResponse.json() : [],
      carrerasResponse.ok ? carrerasResponse.json() : [],
      aceptacionesResponse.ok ? aceptacionesResponse.json() : [],
    ]);

    const meses = [
      "ene.", "feb.", "mar.", "abr.", "may.", "jun.",
      "jul.", "ago.", "sep.", "oct.", "nov.", "dic.",
    ];

    const mesasProcesadas = mesas.map((m: MesaRaw, index: number) => {
      const fechaObj = new Date(m.fecha);
      const fechaFormateada = fechaObj.toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: 'numeric',
        month: 'short'
      }).replace('.', '');
      const modalidad = m.modalidad === "Virtual" ? "Virtual" : "Presencial";

      const materiaNombre = typeof m.materia === 'object' ? m.materia?.nombre || '' : m.materia || '';
      const carreraNombre = typeof m.carrera === 'object' 
        ? m.carrera?.nombre || m.carrera?.id || ''
        : m.carrera || '';
      
      const profesorObj = typeof m.profesor === 'object' ? m.profesor : null;
      const vocalObj = typeof m.vocal === 'object' ? m.vocal : null;

      // Filtrar aceptaciones para esta mesa
      const aceptacionesMesa = aceptaciones.filter((a: any) => a.mesaId === m.id);

      return {
        id: m.id?.toString() || `mesa-${index}`,
        materia: materiaNombre,
        carrera: carreraNombre,
        fecha: fechaFormateada,
        fechaOriginal: m.fecha,
        modalidad,
        color: modalidad === "Virtual" ? "blue" : "green",
        sede: m.sede || "Central",
        profesorId: typeof m.profesor === 'object' ? m.profesor?.id || '' : '',
        vocalId: typeof m.vocal === 'object' ? m.vocal?.id || '' : '',
        profesorNombre: profesorObj 
          ? `${profesorObj.nombre || ''} ${profesorObj.apellido || ''}`
          : typeof m.profesor === 'string' ? m.profesor : '',
        vocalNombre: vocalObj
          ? `${vocalObj.nombre || ''} ${vocalObj.apellido || ''}`
          : typeof m.vocal === 'string' ? m.vocal : '',
        aula: m.aula || "Aula por confirmar",
        webexLink: m.webexLink,
        aceptaciones: aceptacionesMesa.map((a: any) => ({
          profesor: {
            id: a.profesor.id,
            nombre: a.profesor.nombre,
            apellido: a.profesor.apellido,
          },
          estado: a.estado,
        })),
      };
    });

    return json({
      userId,
      role,
      mesas: mesasProcesadas,
      profesores: Array.isArray(profesores) ? profesores : [],
      carreras: Array.isArray(carreras) ? carreras : [],
      notificationConfig,
      env: {
        VAPID_PUBLIC_KEY,
        API_URL,
        INTERNAL_API_KEY,
      },
    });
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
  const mesaId = formData.get("mesaId") as string;
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
  
  // Convertir a UTC manteniendo la hora local
  const fechaUTC = new Date(fechaLocal.getTime() - fechaLocal.getTimezoneOffset() * 60000);

  const mesaData = {
    profesor: profesorId,
    vocal: vocalId,
    carrera,
    materia,
    fecha: fechaUTC.toISOString(),
    horaTexto: hora,
    descripcion: "Mesa de examen",
    cargo: "Titular",
    verification: false,
    modalidad,
    aula: modalidad === "Presencial" ? aula : undefined,
    webexLink: modalidad === "Virtual" ? webexLink : undefined,
  };

  try {
    const url = mesaId 
      ? `${API_URL}/api/diaries/mesas/${mesaId}`
      : `${API_URL}/api/diaries/mesas`;

    const response = await fetch(url, {
      method: mesaId ? "PUT" : "POST",
      headers: {
        "x-api-key": INTERNAL_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mesaData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return json(
        { error: errorData.error || "Error al procesar la mesa" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json({ success: true, data });
  } catch (error) {
    console.error("Error en el action:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Error al procesar la mesa",
      },
      { status: 500 }
    );
  }
};

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);
  return <div>Error: {error instanceof Error ? error.message : "Unknown error"}</div>;
} 
