export function getServerEnv() {
  return {
    API_URL: process.env.API_URL || "http://localhost:3001",
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
  };
}
