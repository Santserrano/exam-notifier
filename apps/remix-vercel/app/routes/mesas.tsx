import { getAuth } from "@clerk/remix/ssr.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  redirect,
  useLoaderData,
  useSearchParams,
  useRouteError,
  useFetcher,
} from "@remix-run/react";
import { Building2, Calendar, Clock, Info, MapPin, User } from "lucide-react";
import { useEffect } from "react";
import { useUser } from "@clerk/remix";

import { Button } from "@exam-notifier/ui/components/button";
import MesaCard from "@exam-notifier/ui/components/MesaCard";
import { SearchBar } from "@exam-notifier/ui/components/SearchBar";

import { clerkClient } from "~/utils/clerk.server";
import HeaderClerk from "../components/HeaderClerk";
import { getServerEnv } from "~/utils/env.server";
import { getNotificationConfig } from "~/utils/notification.server";

interface MesaRaw {
  id: string | number;
  fecha: string;
  modalidad?: string;
  materia?: {
    nombre?: string;
    carrera?: {
      nombre?: string;
    };
  } | string;
  carrera?: {
    nombre?: string;
    id?: string;
  } | string;
  sede?: string;
  profesor?: {
    nombre?: string;
    apellido?: string;
  } | string;
  vocal?: {
    nombre?: string;
    apellido?: string;
  } | string;
  aula?: string;
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
  profesorId: string;
  vocalId: string;
  profesorNombre: string;
  vocalNombre: string;
  aula: string;
  estadoAceptacion: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
}

interface PushEvent extends Event {
  data: PushMessageData;
}

interface PushMessageData {
  json(): any;
}

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;
  if (role !== "profesor") return redirect("/");

  const { API_URL, INTERNAL_API_KEY, VAPID_PUBLIC_KEY } = getServerEnv();
  const notificationConfig = await getNotificationConfig(args);

  try {
    const response = await fetch(
      `${API_URL}/api/diaries/mesas/profesor/${userId}`,
      {
        headers: {
          "x-api-key": INTERNAL_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Error al obtener mesas: ${response.statusText}`);
    }

    const mesasRaw = await response.json();

    const aceptacionesResponse = await fetch(
      `${API_URL}/api/diaries/mesas/aceptaciones/profesor/${userId}`,
      {
        headers: {
          "x-api-key": INTERNAL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const aceptaciones = aceptacionesResponse.ok ? await aceptacionesResponse.json() : [];

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
    const mesas = mesasRaw.map((m: MesaRaw, index: number) => {
      const fechaObj = new Date(m.fecha);
      const fechaFormateada = `${fechaObj.getDate()} ${meses[fechaObj.getMonth()]}`;
      const futura = fechaObj > new Date();
      const modalidad = m.modalidad === "Virtual" ? "Virtual" : "Presencial";

      const materiaNombre = typeof m.materia === 'object' ? m.materia?.nombre || '' : m.materia || '';
      const carreraNombre = typeof m.carrera === 'object' 
        ? m.carrera?.nombre || m.carrera?.id || ''
        : m.carrera || '';
      
      const profesorObj = typeof m.profesor === 'object' ? m.profesor : null;
      const vocalObj = typeof m.vocal === 'object' ? m.vocal : null;

      const aceptacion = aceptaciones.find((a: any) => a.mesaId === m.id);

      return {
        id: m.id?.toString() || `mesa-${index}`,
        materia: materiaNombre,
        carrera: carreraNombre,
        fecha: fechaFormateada,
        fechaOriginal: m.fecha,
        futura,
        modalidad,
        color: modalidad === "Virtual" ? "blue" : "green",
        sede: m.sede || "Central",
        profesorNombre: profesorObj 
          ? `${profesorObj.nombre || ''} ${profesorObj.apellido || ''}`
          : typeof m.profesor === 'string' ? m.profesor : '',
        vocalNombre: vocalObj
          ? `${vocalObj.nombre || ''} ${vocalObj.apellido || ''}`
          : typeof m.vocal === 'string' ? m.vocal : '',
        aula: m.aula || "Aula por confirmar",
        estadoAceptacion: aceptacion?.estado || "PENDIENTE",
      };
    });

    return json({
      userId,
      role,
      mesas,
      notificationConfig: {
        webPushEnabled: notificationConfig?.webPushEnabled ?? false,
        smsEnabled: notificationConfig?.smsEnabled ?? false,
        emailEnabled: notificationConfig?.emailEnabled ?? false,
      },
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
      notificationConfig: {
        webPushEnabled: false,
        smsEnabled: false,
        emailEnabled: false,
      },
      env: {
        VAPID_PUBLIC_KEY,
        API_URL,
        INTERNAL_API_KEY,
      },
    });
  }
};

export const action = async (args: ActionFunctionArgs) => {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const formData = await args.request.formData();
  const type = formData.get("type") as string;
  const subscription = formData.get("subscription");
  const enabled = formData.get("enabled") === "true";
  const mesaId = formData.get("mesaId");
  const estado = formData.get("estado");

  const { API_URL, INTERNAL_API_KEY } = getServerEnv();

  try {
    // Manejar aceptación de mesa
    if (type === "aceptacion" && mesaId && estado) {
      const response = await fetch(
        `${API_URL}/api/diaries/mesas/${mesaId}/aceptacion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": INTERNAL_API_KEY,
          },
          body: JSON.stringify({
            profesorId: userId,
            estado,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar aceptación");
      }

      return json({ success: true });
    }

    // Manejar configuración de notificaciones
    if (type === "webPushEnabled" && subscription) {
      const response = await fetch(`${API_URL}/api/diaries/notificaciones/push-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": INTERNAL_API_KEY,
        },
        body: JSON.stringify({
          profesorId: userId,
          subscription: JSON.parse(subscription as string),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al guardar suscripción");
      }
    }

    // Actualizar la configuración
    const configResponse = await fetch(`${API_URL}/api/diaries/notificaciones/config/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify({
        [type]: enabled,
      }),
    });

    if (!configResponse.ok) {
      throw new Error("Error al actualizar configuración");
    }

    const updatedConfig = await configResponse.json();
    return json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error("Error en la acción:", error);
    return json(
      { success: false, error: error instanceof Error ? error.message : "Error al actualizar" },
      { status: 500 }
    );
  }
};

const carreras = [
  "Ingeniería en sistemas",
  "Arquitectura",
  "Lic. en Nutrición",
  "Lic. en Publicidad",
];
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
  "dic."
];
const sedes = ["Corrientes", "Sáenz Peña", "Posadas", "Resistencia"];
const alumnosMock = [
  { nombre: "Juan Pérez" },
  { nombre: "Ana Gómez" },
  { nombre: "Carlos Ruiz" },
  { nombre: "María López" },
  { nombre: "Gilda R. Romero" },
];

export default function MesasRoute() {
  const { mesas, userId, notificationConfig, env } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();

  // Configurar el service worker al cargar el componente
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('push', ((event: Event) => {
        const pushEvent = event as PushEvent;
        if (pushEvent.data) {
          const data = pushEvent.data.json();
          if (data.data?.mesaId) {
            // Forzar recarga de datos
            fetcher.load('/api/mesas');
            // También recargar la página completa para asegurar que los datos estén actualizados
            window.location.reload();
          }
        }
      }) as EventListener);
    });
  }

  const search = searchParams.get("search") ?? "";
  const carrera = searchParams.get("carrera") ?? "";
  const fecha = searchParams.get("fecha") ?? "";
  const sede = searchParams.get("sede") ?? "";
  const filtroAlumno = searchParams.get("filtroAlumno") ?? "";

  const detalleId = searchParams.get("detalle");
  const alumnosId = searchParams.get("alumnos");

  const actualizarFiltro = (clave: string, valor: string) => {
    if (valor) searchParams.set(clave, valor);
    else searchParams.delete(clave);
    setSearchParams(searchParams);
  };

  const mesasFiltradas = mesas.filter((m: MesaProcesada) => {
    const futura = new Date(m.fechaOriginal) > new Date();
    return (
      (searchParams.get("tab") === "pasadas" ? !futura : futura) &&
      (!search || m.materia.toLowerCase().includes(search.toLowerCase())) &&
      (!carrera || m.carrera === carrera) &&
      (!fecha || m.fecha.includes(fecha)) &&
      (!sede || m.sede === sede)
    );
  });

  const mesaDetalle = mesas.find(
    (m: MesaProcesada) =>
      m.id === detalleId || m.id === alumnosId,
  );

  function DetalleMesa({ mesa }: { mesa: MesaProcesada }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const fetcher = useFetcher();
    const { user } = useUser();

    const esProfesorAsignado = user?.id === mesa.profesorId || user?.id === mesa.vocalId;

    const handleAceptacion = (estado: "ACEPTADA" | "RECHAZADA") => {
      const formData = new FormData();
      formData.append("type", "aceptacion");
      formData.append("mesaId", mesa.id);
      formData.append("estado", estado);
      fetcher.submit(formData, { method: "post" });
    };

    const handleVolver = () => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("detalle");
      newParams.delete("alumnos");
      setSearchParams(newParams);
    };

    const handleVerAlumnos = () => {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("alumnos", mesa.id);
      setSearchParams(newParams);
    };

    const fechaObj = new Date(mesa.fechaOriginal);
    const diasSemana = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    const fechaCompleta = `${diasSemana[fechaObj.getDay()]} ${fechaObj.getDate()} de ${meses[fechaObj.getMonth()]} ${fechaObj.getFullYear()}`;
    const hora = fechaObj.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div className="flex flex-col gap-6 p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleVolver}
            className="text-2xl text-green-900 hover:text-green-700"
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
        <div className="text-sm text-gray-500">{mesa.carrera}</div>
        <Button
          className="bg-blue-800 text-white hover:bg-blue-900"
          onClick={handleVerAlumnos}
        >
          Alumnos inscriptos
        </Button>
        <hr />
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" /> Titular: {mesa.profesorNombre}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" /> Vocal: {mesa.vocalNombre}
        </div>
        <hr />
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4" /> {fechaCompleta}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" /> {hora} hs
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4" /> {mesa.modalidad}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4" /> {mesa.aula}
        </div>
        <hr />
        
        {/* Estado de aceptación */}
        {esProfesorAsignado && (
          <div className="flex flex-col gap-4">
            <div className="text-sm font-semibold text-gray-700">
              Estado de aceptación:
            </div>
            {mesa.estadoAceptacion === "PENDIENTE" ? (
              <div className="flex gap-4">
                <Button
                  onClick={() => handleAceptacion("ACEPTADA")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  Aceptar Mesa
                </Button>
                <Button
                  onClick={() => handleAceptacion("RECHAZADA")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  Rechazar Mesa
                </Button>
              </div>
            ) : (
              <div className={`text-sm font-medium ${
                mesa.estadoAceptacion === "ACEPTADA" ? "text-green-600" : "text-red-600"
              }`}>
                Mesa {mesa.estadoAceptacion === "ACEPTADA" ? "aceptada" : "rechazada"}
              </div>
            )}
          </div>
        )}
        
        <hr />
        <div className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4" /> Recibirás un recordatorio 1 día antes
        </div>
      </div>
    );
  }

  function ListaAlumnos({ mesa }: { mesa: MesaProcesada }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const alumnosFiltrados = alumnosMock.filter((a) =>
      a.nombre.toLowerCase().includes(filtroAlumno.toLowerCase()),
    );

    const handleVolver = () => {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("alumnos");
      newParams.set("detalle", mesa.id);
      setSearchParams(newParams);
    };

    return (
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleVolver}
            className="text-2xl text-green-900 hover:text-green-700"
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
          onChange={(e) => { actualizarFiltro("filtroAlumno", e.target.value); }}
          className="rounded border px-2 py-2"
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

  return (
    <div className="mx-auto max-w-md pb-8">
      <HeaderClerk notificationConfig={notificationConfig} userRole="profesor" env={env} />
      <div className="mt-2 px-4">
        <h2 className="py-2 text-lg font-bold text-green-900 px-4">Mis Mesas</h2>
        <SearchBar
          searchValue={search}
          onSearchChange={(val) => { actualizarFiltro("search", val); }}
          carreras={carreras}
          carreraSeleccionada={carrera}
          onCarreraChange={(val) => { actualizarFiltro("carrera", val); }}
          fechas={fechas}
          fechaSeleccionada={fecha}
          onFechaChange={(val) => { actualizarFiltro("fecha", val); }}
          sedes={sedes}
          sedeSeleccionada={sede}
          onSedeChange={(val) => { actualizarFiltro("sede", val); }}
          showAddMesaButton={false}
        />

        {/* Filtro Futuras/Pasadas */}
        <div className="mb-4 flex items-center justify-center gap-4 pt-4 text-center">
          <span className="text-lg font-semibold text-blue-900">
            Próximas mesas
          </span>
          <div className="flex overflow-hidden rounded-lg border border-gray-300">
            <button
              type="button"
              className={`px-4 py-1 text-sm font-semibold transition-colors focus:outline-none ${searchParams.get("tab") !== "pasadas" ? "bg-blue-900 text-white" : "bg-white text-blue-900"}`}
              onClick={() => {
                searchParams.delete("tab");
                setSearchParams(searchParams);
              }}
            >
              Futuras
            </button>
            <button
              type="button"
              className={`border-l border-gray-300 px-4 py-1 text-sm font-semibold transition-colors focus:outline-none ${searchParams.get("tab") === "pasadas" ? "bg-blue-900 text-white" : "bg-white text-blue-900"}`}
              onClick={() => {
                searchParams.set("tab", "pasadas");
                setSearchParams(searchParams);
              }}
            >
              Pasadas
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-3xl">
          {detalleId && mesaDetalle ? (
            <DetalleMesa mesa={mesaDetalle} />
          ) : alumnosId && mesaDetalle ? (
            <ListaAlumnos mesa={mesaDetalle} />
          ) : mesasFiltradas.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No hay mesas para mostrar.
            </div>
          ) : (
            mesasFiltradas.map((mesa: MesaProcesada) => {
              console.log("Renderizando mesa:", mesa);
              return (
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
              );
            })
          )}
        </div>

        <div className="mt-4 w-full px-2 text-center text-xs">
          <div className="mb-1 text-red-600">
            <span className="align-middle">
              ¿Notás algún error en las mesas?
            </span>
          </div>
          <a href="#" className="text-blue-800 underline">
            Contactar a oficina de docentes
          </a>
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