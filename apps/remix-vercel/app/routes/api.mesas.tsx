import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getServerEnv } from "~/utils/env.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { API_URL, INTERNAL_API_KEY } = getServerEnv();
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return json({ error: "ID de usuario no proporcionado" }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${API_URL}/api/diaries/mesas/profesor/${userId}`,
      {
        headers: {
          "x-api-key": INTERNAL_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Error al obtener mesas: ${response.statusText}`);
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error("Error en el loader:", error);
    return json(
      { error: error instanceof Error ? error.message : "Error al cargar las mesas" },
      { status: 500 }
    );
  }
}; 