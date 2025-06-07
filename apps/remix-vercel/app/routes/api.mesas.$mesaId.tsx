import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getServerEnv } from "~/utils/env.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { API_URL, INTERNAL_API_KEY } = getServerEnv();
  const mesaId = params.mesaId;
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!mesaId) {
    return json({ error: "ID de mesa no proporcionado" }, { status: 400 });
  }

  if (!userId) {
    return json({ error: "ID de usuario no proporcionado" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${API_URL}/api/diaries/mesas/${mesaId}?userId=${userId}`,
      {
        headers: {
          "x-api-key": INTERNAL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener mesa: ${response.statusText}`);
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Error en el loader:", error);
    return json(
      { error: error instanceof Error ? error.message : "Error al cargar la mesa" },
      { status: 500 }
    );
  }
}; 