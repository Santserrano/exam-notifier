export function getServerEnv() {
  const API_URL = process.env.API_URL;
  if (!API_URL) {
    throw new Error("API_URL no está definida en las variables de entorno");
  }

  return {
    API_URL,
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || "",
  };
}
