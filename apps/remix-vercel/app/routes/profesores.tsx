import React, { useState } from "react";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";

import { Button, Modal } from "@exam-notifier/ui";

import { clerkClient } from "~/utils/clerk.server";
import { getServerEnv } from "~/utils/env.server";

interface Profesor {
  id: string;
  nombre: string;
  apellido: string;
  carreras: { id: string; nombre: string }[];
  materias: { id: string; nombre: string; carreraId: string }[];
}

interface Carrera {
  id: string;
  nombre: string;
  materias: { id: string; nombre: string }[];
}

interface ActionData {
  error?: string;
  message?: string;
  profesor?: unknown;
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

  const { API_URL } = getServerEnv();

  try {
    const [profesoresResponse, carrerasResponse] = await Promise.all([
      fetch(`${API_URL}/api/diaries/profesores`, {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
          "Content-Type": "application/json",
        },
      }),
      fetch(`${API_URL}/api/diaries/carreras`, {
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
          "Content-Type": "application/json",
        },
      }),
    ]);

    const [profesores, carreras] = await Promise.all([
      profesoresResponse.ok ? profesoresResponse.json() : [],
      carrerasResponse.ok ? carrerasResponse.json() : [],
    ]);

    return json({ profesores, carreras });
  } catch (error) {
    console.error("Error en el loader:", error);
    return json({ profesores: [], carreras: [] });
  }
};

export const action = async ({
  request,
  params,
  context,
}: ActionFunctionArgs) => {
  const { userId } = await getAuth({ request, params, context });

  if (!userId) {
    return json<ActionData>({ error: "No autorizado" }, { status: 401 });
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (role !== "admin") {
    return json<ActionData>({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.json();
  const { profesorId, carreras, materias } = formData;

  const { API_URL } = getServerEnv();

  try {
    const response = await fetch(
      `${API_URL}/api/diaries/profesores/${profesorId}/config`,
      {
        method: "PUT",
        headers: {
          "x-api-key": process.env.INTERNAL_API_KEY || "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ carreras, materias }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return json<ActionData>(
        {
          error:
            data.error || data.details || "Error al guardar la configuración",
        },
        { status: response.status },
      );
    }

    return json<ActionData>(data);
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return json<ActionData>(
      { error: "Error al actualizar la configuración" },
      { status: 500 },
    );
  }
};

export default function AdminProfesoresRoute() {
  const { profesores, carreras } = useLoaderData<typeof loader>();
  const [profesorSeleccionado, setProfesorSeleccionado] =
    useState<Profesor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const fetcher = useFetcher<ActionData>();

  const handleSaveConfig = async (
    profesorId: string,
    carrerasSeleccionadas: string[],
    materiasSeleccionadas: string[],
  ) => {
    fetcher.submit(
      {
        profesorId,
        carreras: carrerasSeleccionadas,
        materias: materiasSeleccionadas,
      },
      { method: "post", encType: "application/json" },
    );
  };

  // Efecto para manejar la respuesta del fetcher
  React.useEffect(() => {
    if (fetcher.data && !fetcher.data.error) {
      setShowModal(false);
      window.location.reload();
    } else if (fetcher.data?.error) {
      alert(fetcher.data.error);
    }
  }, [fetcher.data]);

  return (
    <div className="flex min-h-screen flex-col items-center bg-white py-10">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex items-center gap-4 px-2">
          <Link to="/admin">
            <Button
              variant="outline"
              className="hover:bg-muted rounded-2xl px-4 py-2 text-sm font-medium transition"
            >
              ← Volver
            </Button>
          </Link>
          <h1 className="ml-2 text-base md:text-lg font-extrabold tracking-tight text-green-900">
            Gestión de Profesores
          </h1>
        </div>
        <div className="flex flex-col gap-4">
          {profesores.map((profesor: Profesor) => (
            <div
              key={profesor.id}
              className="flex min-h-[120px] w-full flex-col rounded-lg border border-green-200 bg-white p-4 shadow md:flex-row md:items-center md:justify-between"
            >
              <div className="mb-3 flex-1 md:mb-0">
                <h2 className="mb-2 text-xl font-semibold text-green-800">
                  {profesor.nombre} {profesor.apellido}
                </h2>
                <div className="mb-1 flex flex-wrap gap-2">
                  <span className="font-semibold text-green-700">
                    Carreras:
                  </span>
                  {profesor.carreras.map(
                    (c: { id: string; nombre: string }) => (
                      <span
                        key={c.id}
                        className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
                      >
                        {c.nombre}
                      </span>
                    ),
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="font-semibold text-blue-700">Materias:</span>
                  {profesor.materias.map((materia) => (
                    <span
                      key={materia.id}
                      className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                    >
                      {materia.nombre} (
                      {
                        carreras.find(
                          (c: Carrera) => c.id === materia.carreraId,
                        )?.nombre
                      }
                      )
                    </span>
                  ))}
                </div>
              </div>
              <Button
                className="mt-4 rounded bg-green-600 px-4 py-1 text-white shadow hover:bg-green-700 md:ml-6 md:mt-0"
                onClick={() => {
                  setProfesorSeleccionado(profesor);
                  setShowModal(true);
                }}
              >
                Configurar
              </Button>
            </div>
          ))}
        </div>
      </div>
      {showModal && profesorSeleccionado && (
        <ConfiguracionProfesorModal
          profesor={profesorSeleccionado}
          carreras={carreras}
          onClose={() => { setShowModal(false); }}
          onSave={handleSaveConfig}
        />
      )}
    </div>
  );
}

function ConfiguracionProfesorModal({
  profesor,
  carreras,
  onClose,
  onSave,
}: {
  profesor: Profesor;
  carreras: Carrera[];
  onClose: () => void;
  onSave: (profesorId: string, carreras: string[], materias: string[]) => void;
}) {
  const [carrerasSeleccionadas, setCarrerasSeleccionadas] = useState<string[]>(
    profesor.carreras.map((c) => c.id),
  );
  const [materiasSeleccionadas, setMateriasSeleccionadas] = useState<string[]>(
    profesor.materias.map((m) => m.id),
  );

  const handleCarreraChange = (carreraId: string) => {
    setCarrerasSeleccionadas((prev) => {
      if (prev.includes(carreraId)) {
        // Si se deselecciona una carrera, también deseleccionar sus materias
        const carrera = carreras.find((c) => c.id === carreraId);
        if (carrera) {
          setMateriasSeleccionadas((prevMaterias) =>
            prevMaterias.filter(
              (m) => !carrera.materias.some((cm) => cm.id === m),
            ),
          );
        }
        return prev.filter((id) => id !== carreraId);
      }
      return [...prev, carreraId];
    });
  };

  const handleMateriaChange = (materiaId: string, carreraId: string) => {
    setMateriasSeleccionadas((prev) => {
      if (prev.includes(materiaId)) {
        return prev.filter((id) => id !== materiaId);
      }
      return [...prev, materiaId];
    });
  };

  return (
    <Modal open={true} onClose={onClose} title="Configurar Profesor">
      <div className="max-h-[70vh] space-y-6 overflow-y-auto p-2 md:p-4">
        <div>
          <h3 className="mb-2 font-semibold text-green-800">Carreras:</h3>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {carreras.map((carrera) => (
              <label
                key={carrera.id}
                className="flex cursor-pointer items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={carrerasSeleccionadas.includes(carrera.id)}
                  onChange={() => { handleCarreraChange(carrera.id); }}
                  className="accent-green-600"
                />
                <span className="text-green-900">{carrera.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 font-semibold text-blue-800">Materias:</h3>
          <div className="grid max-h-[250px] grid-cols-1 gap-2 overflow-y-auto pr-2 md:grid-cols-2">
            {carreras
              .filter((carrera) => carrerasSeleccionadas.includes(carrera.id))
              .map((carrera) => (
                <div key={carrera.id} className="space-y-2">
                  <h4 className="font-medium text-blue-700">
                    {carrera.nombre}:
                  </h4>
                  {carrera.materias.map((materia) => (
                    <label
                      key={materia.id}
                      className="flex cursor-pointer items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={materiasSeleccionadas.includes(materia.id)}
                        onChange={() => { handleMateriaChange(materia.id, carrera.id); }}
                        className="accent-blue-600"
                      />
                      <span className="text-blue-900">{materia.nombre}</span>
                    </label>
                  ))}
                </div>
              ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button onClick={onClose} variant="outline" className="px-4 py-1">
            Cancelar
          </Button>
          <Button
            onClick={() => { onSave(profesor.id, carrerasSeleccionadas, materiasSeleccionadas); }}
            className="rounded bg-green-600 px-6 py-1 text-white shadow hover:bg-green-700"
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
