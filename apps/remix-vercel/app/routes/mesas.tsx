import { getAuth } from "@clerk/remix/ssr.server";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  redirect,
  useLoaderData,
  useSearchParams,
  useRouteError,
  useFetcher,
  useNavigate,
} from "@remix-run/react";
import { Building2, Calendar, Clock, Info, MapPin, User, CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
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
  materiaId: string;
  carrera: string;
  carreraId: string;
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
  hora?: string;
  webexLink?: string;
  descripcion?: string;
  cargo?: string;
  verification?: boolean;
  estadoAceptacion: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
  aceptaciones?: Array<{
    profesor: {
      id: string;
      nombre: string;
      apellido: string;
    };
    estado: "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
  }>;
  horaTexto?: string;
}

interface PushEvent extends Event {
  data: PushMessageData;
}

interface PushMessageData {
  json(): any;
}

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (role !== "profesor") {
    return redirect("/");
  }

  const { API_URL, INTERNAL_API_KEY, VAPID_PUBLIC_KEY } = getServerEnv();
  const notificationConfig = await getNotificationConfig(args);

  try {
    // Obtener las mesas y aceptaciones del backend
    const [mesasResponse, aceptacionesResponse] = await Promise.all([
      fetch(`${API_URL}/api/diaries/mesas`, {
        headers: {
          "x-api-key": INTERNAL_API_KEY,
          "Content-Type": "application/json",
        },
      }).catch((error: unknown) => {
        console.error("Error al obtener mesas:", error);
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

    const [mesas, aceptaciones] = await Promise.all([
      mesasResponse.ok ? mesasResponse.json() : [],
      aceptacionesResponse.ok ? aceptacionesResponse.json() : [],
    ]);

    const mesasProcesadas = mesas.map((m: MesaRaw, index: number) => {
      const fechaObj = new Date(m.fecha);
      const fechaFormateada = fechaObj.toLocaleDateString('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        day: 'numeric',
        month: 'short'
      }).replace('.', '');
      const modalidad = m.modalidad === "Virtual" ? "Virtual" : "Presencial";

      // Asegurarse de que materia y carrera sean objetos con id y nombre
      const materiaObj = typeof m.materia === 'object' ? m.materia : { id: m.materia, nombre: m.materia };
      const carreraObj = typeof m.carrera === 'object' ? m.carrera : { id: m.carrera, nombre: m.carrera };
      
      // Asegurarse de que profesor y vocal sean objetos con id, nombre y apellido
      const profesorObj = typeof m.profesor === 'object' ? m.profesor : { 
        id: m.profesor, 
        nombre: m.profesor?.toString().split(' ')[0] || '', 
        apellido: m.profesor?.toString().split(' ')[1] || '' 
      };
      const vocalObj = typeof m.vocal === 'object' ? m.vocal : { 
        id: m.vocal, 
        nombre: m.vocal?.toString().split(' ')[0] || '', 
        apellido: m.vocal?.toString().split(' ')[1] || '' 
      };

      // Filtrar aceptaciones para esta mesa
      const aceptacionesMesa = aceptaciones.filter((a: any) => a.mesaId === m.id);

      // Determinar el estado de aceptación para el profesor actual
      const aceptacionProfesor = aceptacionesMesa.find((a: any) => a.profesor.id === userId);
      const estadoAceptacion = aceptacionProfesor?.estado || "PENDIENTE";

      return {
        id: m.id?.toString() || `mesa-${index}`,
        materia: materiaObj.nombre || '',
        materiaId: materiaObj.id || '',
        carrera: carreraObj.nombre || '',
        carreraId: carreraObj.id || '',
        fecha: fechaFormateada,
        fechaOriginal: m.fecha,
        modalidad,
        color: modalidad === "Virtual" ? "blue" : "green",
        sede: m.sede || "Central",
        profesorId: profesorObj.id || '',
        vocalId: vocalObj.id || '',
        profesorNombre: `${profesorObj.nombre || ''} ${profesorObj.apellido || ''}`.trim(),
        vocalNombre: `${vocalObj.nombre || ''} ${vocalObj.apellido || ''}`.trim(),
        aula: m.aula || "Aula por confirmar",
        webexLink: m.webexLink,
        hora: m.hora,
        estadoAceptacion,
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
      try {
        const url = `${API_URL}/api/diaries/mesas/${mesaId}/aceptacion`;
        const body = {
          profesorId: userId,
          estado,
        };
        
        console.log("Intentando actualizar aceptación:", {
          url,
          body,
          mesaId,
          userId,
          estado
        });

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": INTERNAL_API_KEY,
          },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Error response:", {
            url,
            status: response.status,
            statusText: response.statusText,
            errorData,
            body
          });
          throw new Error(`Error al actualizar aceptación: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        return json({ success: true });
      } catch (error) {
        console.error("Error detallado:", error);
        throw error;
      }
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
  "Ingeniería en Sistemas",
  "Arquitectura",
  "Lic. en Nutrición",
  "Lic. en Publicidad",
];

const fechas = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic"
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
  const navigate = useNavigate();

  // Estado local para manejar la vista actual
  const [currentView, setCurrentView] = useState<'list' | 'detail' | 'students'>(() => {
    if (searchParams.get("alumnos")) return 'students';
    if (searchParams.get("detalle")) return 'detail';
    return 'list';
  });

  const [selectedMesa, setSelectedMesa] = useState<MesaProcesada | null>(() => {
    const detalleId = searchParams.get("detalle");
    const alumnosId = searchParams.get("alumnos");
    return mesas.find((m: MesaProcesada) => m.id === detalleId || m.id === alumnosId) || null;
  });

  // Configurar el service worker al cargar el componente
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.addEventListener('push', ((event: Event) => {
          const pushEvent = event as PushEvent;
          if (pushEvent.data) {
            const data = pushEvent.data.json();
            if (data.data?.mesaId) {
              // Si estamos en una vista detallada o de alumnos, volver a la vista principal
              if (currentView !== 'list') {
                navigate('/mesas');
              }
              // Forzar la recarga de la página
              window.location.reload();
            }
          }
        }) as EventListener);
      });
    }
  }, [currentView, navigate]);

  // Efecto para recargar los datos cuando se crea una nueva mesa
  useEffect(() => {
    if (searchParams.get("refresh") === "true") {
      fetcher.load(`/api/mesas?userId=${userId}`);
      searchParams.delete("refresh");
      setSearchParams(searchParams);
    }
  }, [searchParams, fetcher, userId]);

  // Efecto para recargar los datos periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      fetcher.load(`/api/mesas?userId=${userId}`);
    }, 30000); // Recargar cada 30 segundos

    return () => clearInterval(interval);
  }, [userId, fetcher]);

  const search = searchParams.get("search") ?? "";
  const carrera = searchParams.get("carrera") ?? "";
  const fecha = searchParams.get("fecha") ?? "";
  const sede = searchParams.get("sede") ?? "";
  const filtroAlumno = searchParams.get("filtroAlumno") ?? "";

  const actualizarFiltro = (clave: string, valor: string) => {
    if (valor) searchParams.set(clave, valor);
    else searchParams.delete(clave);
    setSearchParams(searchParams);
  };

  const mesasFiltradas = mesas.filter((m: MesaProcesada) => {
    const futura = new Date(m.fechaOriginal) > new Date();
    
    // Obtener el mes de la fecha original para comparar
    const fechaObj = new Date(m.fechaOriginal);
    const mesMesa = fechaObj.toLocaleDateString('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      month: 'short'
    }).replace('.', '').toLowerCase();

    return (
      (searchParams.get("tab") === "pasadas" ? !futura : futura) &&
      (!search || m.materia.toLowerCase().includes(search.toLowerCase())) &&
      (!carrera || m.carrera === carrera) &&
      (!fecha || mesMesa === fecha.toLowerCase()) &&
      (!sede || m.sede === sede)
    );
  });

  // Función optimizada para manejar la navegación
  const handleNavigation = (type: 'detalle' | 'alumnos' | 'back', mesaId?: string) => {
    const mesa = mesaId ? mesas.find((m: MesaProcesada) => m.id === mesaId) : null;
    
    switch (type) {
      case 'detalle':
        setCurrentView('detail');
        setSelectedMesa(mesa);
        break;
      case 'alumnos':
        setCurrentView('students');
        setSelectedMesa(mesa);
        break;
      case 'back':
        if (currentView === 'students') {
          setCurrentView('detail');
        } else {
          setCurrentView('list');
          setSelectedMesa(null);
        }
        break;
    }
  };

  // Renderizado condicional basado en la vista actual
  if (currentView === 'students' && selectedMesa) {
    return (
      <div className="mx-auto max-w-md pb-8">
        <HeaderClerk notificationConfig={notificationConfig} userRole="profesor" env={env} />
        <ListaAlumnos 
          mesa={selectedMesa} 
          filtroAlumno={filtroAlumno}
          onFiltroChange={(valor) => actualizarFiltro("filtroAlumno", valor)}
          onVolver={() => handleNavigation('back')}
        />
      </div>
    );
  }

  if (currentView === 'detail' && selectedMesa) {
    return (
      <div className="mx-auto max-w-md pb-8">
        <HeaderClerk notificationConfig={notificationConfig} userRole="profesor" env={env} />
        <DetalleMesa 
          mesa={selectedMesa} 
          onVerAlumnos={() => handleNavigation('alumnos', selectedMesa.id)}
          onVolver={() => handleNavigation('back')}
        />
      </div>
    );
  }

  // Vista principal de mesas
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
          {mesasFiltradas.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No hay mesas para mostrar.
            </div>
          ) : (
            mesasFiltradas.map((mesa: MesaProcesada) => (
              <MesaCard
                key={mesa.id}
                fecha={mesa.fecha}
                materia={mesa.materia}
                carrera={mesa.carrera}
                modalidad={mesa.modalidad}
                color={mesa.color}
                mesaId={mesa.id}
                userId={userId}
                onClick={() => handleNavigation('detalle', mesa.id)}
              />
            ))
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

interface DetalleMesaProps {
  mesa: MesaProcesada;
  onVerAlumnos: () => void;
  onVolver: () => void;
}

function DetalleMesa({ mesa, onVerAlumnos, onVolver }: DetalleMesaProps) {
  const fetcher = useFetcher();
  const { user } = useUser();
  const esProfesorAsignado = user?.id === mesa.profesorId || user?.id === mesa.vocalId;
  const [estadoLocal, setEstadoLocal] = useState<"PENDIENTE" | "ACEPTADA" | "RECHAZADA">(mesa.estadoAceptacion);

  // Efecto para actualizar el estado local cuando cambia el estado de la mesa
  useEffect(() => {
    setEstadoLocal(mesa.estadoAceptacion);
  }, [mesa.estadoAceptacion]);

  // Efecto para guardar el estado en localStorage
  useEffect(() => {
    if (estadoLocal !== "PENDIENTE") {
      localStorage.setItem(`mesa-${mesa.id}-estado`, estadoLocal);
    }
  }, [estadoLocal, mesa.id]);

  // Efecto para cargar el estado desde localStorage al montar el componente
  useEffect(() => {
    const estadoGuardado = localStorage.getItem(`mesa-${mesa.id}-estado`);
    if (estadoGuardado && ["ACEPTADA", "RECHAZADA"].includes(estadoGuardado)) {
      setEstadoLocal(estadoGuardado as "ACEPTADA" | "RECHAZADA");
    }
  }, [mesa.id]);

  const handleAceptacion = (estado: "ACEPTADA" | "RECHAZADA") => {
    const formData = new FormData();
    formData.append("type", "aceptacion");
    formData.append("mesaId", mesa.id);
    formData.append("estado", estado);
    fetcher.submit(formData, { method: "post" });
    setEstadoLocal(estado);
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

  // Formatear la fecha usando la zona horaria de Argentina
  const fechaCompleta = fechaObj.toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Función para obtener el ícono según el estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "ACEPTADA":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "RECHAZADA":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <span className="h-5 w-5 text-gray-400">○</span>;
    }
  };

  // Función para obtener el texto según el estado
  const getEstadoText = (estado: string) => {
    switch (estado) {
      case "ACEPTADA":
        return "Aceptada";
      case "RECHAZADA":
        return "Rechazada";
      default:
        return "Pendiente";
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onVolver}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl text-green-900 hover:bg-gray-200"
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
        type="button"
        className="w-full bg-blue-800 text-white hover:bg-blue-900"
        onClick={onVerAlumnos}
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
        <Clock className="h-4 w-4" /> {mesa.horaTexto || "Hora por confirmar"}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <MapPin className="h-4 w-4" /> {mesa.modalidad}
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Building2 className="h-4 w-4" /> {mesa.aula}
      </div>
      <hr />
      
      {esProfesorAsignado && (
        <div className="flex flex-col gap-4">
          <div className="text-sm font-semibold text-gray-700">
            Estado de aceptación:
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Titular</span>
              <div className="flex items-center gap-2">
                {getEstadoIcon(mesa.aceptaciones?.find(a => a.profesor.id === mesa.profesorId)?.estado || "PENDIENTE")}
                <span className="text-sm">
                  {getEstadoText(mesa.aceptaciones?.find(a => a.profesor.id === mesa.profesorId)?.estado || "PENDIENTE")}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm font-medium">Vocal</span>
              <div className="flex items-center gap-2">
                {getEstadoIcon(mesa.aceptaciones?.find(a => a.profesor.id === mesa.vocalId)?.estado || "PENDIENTE")}
                <span className="text-sm">
                  {getEstadoText(mesa.aceptaciones?.find(a => a.profesor.id === mesa.vocalId)?.estado || "PENDIENTE")}
                </span>
              </div>
            </div>
          </div>

          {estadoLocal === "PENDIENTE" && (
            <div className="flex flex-col gap-2">
              <div className="text-xs text-gray-500 mb-2">
                Por favor, confirma tu disponibilidad para esta mesa:
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={() => handleAceptacion("ACEPTADA")}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={fetcher.state === "submitting"}
                >
                  {fetcher.state === "submitting" ? "Procesando..." : "Aceptar Mesa"}
                </Button>
                <Button
                  onClick={() => handleAceptacion("RECHAZADA")}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={fetcher.state === "submitting"}
                >
                  {fetcher.state === "submitting" ? "Procesando..." : "Rechazar Mesa"}
                </Button>
              </div>
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

interface ListaAlumnosProps {
  mesa: MesaProcesada;
  filtroAlumno: string;
  onFiltroChange: (valor: string) => void;
  onVolver: () => void;
}

function ListaAlumnos({ mesa, filtroAlumno, onFiltroChange, onVolver }: ListaAlumnosProps) {
  const alumnosFiltrados = alumnosMock.filter((a) =>
    a.nombre.toLowerCase().includes(filtroAlumno.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onVolver}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-2xl text-green-900 hover:bg-gray-200"
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
        onChange={(e) => onFiltroChange(e.target.value)}
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

export function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-md bg-slate-50 p-12">
        <h1 className="text-3xl font-bold text-slate-900">¡Ups! Algo salió mal...</h1>
        <p className="text-slate-700">No pudimos cargar los detalles de la mesa.</p>
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {error instanceof Error ? error.message : "Error desconocido"}
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Por favor, intenta nuevamente o contacta a soporte si el problema persiste.</p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  );
}