import { getAuth } from "@clerk/remix/ssr.server";
import { json, type ActionFunctionArgs } from "@remix-run/node";
import { getServerEnv } from "~/utils/env.server";

export const action = async ({ request, params, context }: ActionFunctionArgs) => {
  const { userId } = await getAuth({ request, params, context });
  if (!userId) {
    return json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const type = formData.get("type") as string;
  const enabled = formData.get("enabled") === "true";
  const subscription = formData.get("subscription") as string;

  const { API_URL, INTERNAL_API_KEY } = getServerEnv();

  try {
    if (type === "webPushEnabled" && enabled && subscription) {
      // Guardar la suscripción
      const response = await fetch(
        `${API_URL}/api/diaries/notificaciones/push-subscription`,
        {
          method: "POST",
          headers: {
            "x-api-key": INTERNAL_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profesorId: userId,
            subscription: JSON.parse(subscription),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al guardar la suscripción");
      }
    }

    // Actualizar la configuración
    const response = await fetch(
      `${API_URL}/api/diaries/notificaciones/config/${userId}`,
      {
        method: "PATCH",
        headers: {
          "x-api-key": INTERNAL_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [type]: enabled,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Error al actualizar la configuración");
    }

    const config = await response.json();
    return json({
      message: `Notificaciones ${enabled ? "activadas" : "desactivadas"}`,
      config,
    });
  } catch (error) {
    console.error("Error en la acción de notificaciones:", error);
    return json(
      {
        error: error instanceof Error ? error.message : "Error al procesar la solicitud",
      },
      { status: 500 }
    );
  }
}; 