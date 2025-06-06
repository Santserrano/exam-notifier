import {
  useLoaderData,
  useSearchParams,
  json,
  redirect,
} from "@remix-run/react";
import { getAuth } from "@clerk/remix/ssr.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Building2,
  Calendar,
  Clock,
  Info,
  MapPin,
  User,
} from "lucide-react";
import { Button } from "@exam-notifier/ui/components/button";
import MesaCard from "@exam-notifier/ui/components/MesaCard";
import Modal from "@exam-notifier/ui/components/Modal";
import { SearchBar } from "@exam-notifier/ui/components/SearchBar";
import { clerkClient } from "~/utils/clerk.server";
import HeaderClerk from "../components/HeaderClerk";
import { getEnv } from '../utils/env.server';
import { ActivarNotificaciones } from "../components/ActivarNotificaciones";

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);
  if (!userId) return redirect("/sign-in");

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;
  if (role !== "profesor") return redirect("/");

  try {
    const response = await fetch(`${process.env.API_URL}/api/diaries/mesas/profesor/${userId}`, {
      headers: {
        "x-api-key": process.env.INTERNAL_API_KEY || "",
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener mesas: ${response.statusText}`);
    }

    const mesasRaw = await response.json();

    const meses = ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."];
    const mesas = mesasRaw.map((m: any, index: number) => {
      const fechaObj = new Date(m.fecha);
      const fechaFormateada = `${fechaObj.getDate()} ${meses[fechaObj.getMonth()]}`;
      const futura = fechaObj > new Date();
      const modalidad = m.modalidad || "Presencial";
      return {
        id: m.id || `mesa-${index}`,
        materia: m.materia?.nombre || m.materia,
        carrera: m.materia?.carrera?.nombre || m.carrera?.nombre || m.carrera?.id || m.carrera,
        fecha: fechaFormateada,
        fechaOriginal: m.fecha,
        futura,
        modalidad,
        color: modalidad === "Virtual" ? "blue" : "green",
        sede: m.sede || "Central",
        profesorNombre: m.profesor?.nombre ? `${m.profesor.nombre} ${m.profesor.apellido}` : m.profesor,
        vocalNombre: m.vocal?.nombre ? `${m.vocal.nombre} ${m.vocal.apellido}` : m.vocal,
        aula: m.aula || "Aula por confirmar"
      };
    });

    return json({ 
      userId, 
      role, 
      mesas,
      env: {
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
        INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
        API_URL: process.env.API_URL
      }
    });
  } catch (error) {
    return json({ 
      userId, 
      role, 
      mesas: [],
      env: {
        VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
        INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
        API_URL: process.env.API_URL
      }
    });
  }
};

const carreras = ["Ingeniería en sistemas", "Arquitectura", "Lic. en Nutrición", "Lic. en Publicidad"];
const fechas = ["mar.", "abr."];
const sedes = ["Corrientes", "Sáenz Peña", "Posadas", "Resistencia"];
const alumnosMock = [
  { nombre: "Juan Pérez" },
  { nombre: "Ana Gómez" },
  { nombre: "Carlos Ruiz" },
  { nombre: "María López" },
  { nombre: "Gilda R. Romero" },
];

export default function MesasRoute() {
  const { mesas, userId } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();

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

  const mesasFiltradas = mesas.filter((m: any) => {
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
    (m: any) => m.id?.toString() === detalleId || m.id?.toString() === alumnosId
  );

  function DetalleMesa({ mesa }: { mesa: any }) {
    const fechaObj = new Date(mesa.fechaOriginal);
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const fechaCompleta = `${diasSemana[fechaObj.getDay()]} ${fechaObj.getDate()} de ${meses[fechaObj.getMonth()]} ${fechaObj.getFullYear()}`;
    const hora = fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="flex flex-col gap-6 p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              searchParams.delete("detalle");
              setSearchParams(searchParams);
            }}
            className="text-2xl text-green-900"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-green-900 text-center flex-1">Detalle de Mesa</h2>
        </div>
        <div className="text-lg font-semibold text-green-900">{mesa.materia}</div>
        <div className="text-sm text-gray-500">{mesa.carrera}</div>
        <Button
          className="bg-blue-800 text-white"
          onClick={() => {
            searchParams.delete("detalle");
            searchParams.set("alumnos", mesa.id);
            setSearchParams(searchParams);
          }}
        >
          Alumnos inscriptos
        </Button>
        <hr />
        <div className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Titular: {mesa.profesorNombre}</div>
        <div className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> Vocal: {mesa.vocalNombre}</div>
        <hr />
        <div className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4" /> {fechaCompleta}</div>
        <div className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> {hora} hs</div>
        <div className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> {mesa.modalidad}</div>
        <div className="text-sm flex items-center gap-2"><Building2 className="h-4 w-4" /> {mesa.aula}</div>
        <hr />
        <div className="text-sm flex items-center gap-2"><Info className="h-4 w-4" /> Recibirás un recordatorio 1 día antes</div>
      </div>
    );
  }

  function ListaAlumnos({ mesa }: { mesa: any }) {
    const alumnosFiltrados = alumnosMock.filter((a) =>
      a.nombre.toLowerCase().includes(filtroAlumno.toLowerCase())
    );
    return (
      <div className="flex flex-col gap-2 p-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              searchParams.delete("alumnos");
              setSearchParams(searchParams);
            }}
            className="text-2xl text-green-900"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-green-900 text-center flex-1">Alumnos inscriptos</h2>
        </div>
        <input
          type="text"
          placeholder="Buscar alumno por nombre"
          value={filtroAlumno}
          onChange={(e) => actualizarFiltro("filtroAlumno", e.target.value)}
          className="rounded border px-2 py-2"
        />
        <div className="flex flex-col gap-1">
          {alumnosFiltrados.length === 0 ? (
            <div className="text-center text-gray-500">No hay alumnos para mostrar.</div>
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
      <HeaderClerk />
      <div className="px-4 mt-2">
        <h2 className="text-lg font-bold text-green-900 mb-4">Mis Mesas</h2>
        <SearchBar
          searchValue={search}
          onSearchChange={(val) => actualizarFiltro("search", val)}
          carreras={carreras}
          carreraSeleccionada={carrera}
          onCarreraChange={(val) => actualizarFiltro("carrera", val)}
          fechas={fechas}
          fechaSeleccionada={fecha}
          onFechaChange={(val) => actualizarFiltro("fecha", val)}
          sedes={sedes}
          sedeSeleccionada={sede}
          onSedeChange={(val) => actualizarFiltro("sede", val)}
          showAddMesaButton={false}
        />

        {/* Filtro Futuras/Pasadas */}
        <div className="flex items-center justify-center text-center gap-4 mb-4 pt-4">
          <span className="text-lg font-semibold text-blue-900">Próximas mesas</span>
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              type="button"
              className={`px-4 py-1 text-sm font-semibold focus:outline-none transition-colors ${searchParams.get("tab") !== "pasadas" ? "bg-blue-900 text-white" : "bg-white text-blue-900"}`}
              onClick={() => {
                searchParams.delete("tab");
                setSearchParams(searchParams);
              }}
            >
              Futuras
            </button>
            <button
              type="button"
              className={`px-4 py-1 text-sm font-semibold focus:outline-none transition-colors border-l border-gray-300 ${searchParams.get("tab") === "pasadas" ? "bg-blue-900 text-white" : "bg-white text-blue-900"}`}
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
            <div className="text-center text-gray-500 py-8">No hay mesas para mostrar.</div>
          ) : (
            mesasFiltradas.map((mesa: any) => {
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

        <div className="text-xs text-center w-full mt-4 px-2">
          <div className="text-red-600 mb-1">
            <span className="align-middle">¿Notás algún error en las mesas?</span>
          </div>
          <a href="#" className="underline text-blue-800">Contactar a oficina de docentes</a>
        </div>
      </div>
    </div>
  );
}
