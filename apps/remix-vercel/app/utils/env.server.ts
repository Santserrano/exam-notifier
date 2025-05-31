// env.server.ts
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const clientEnvSchema = z.object({
  PUBLIC_API_URL: z.string().url(),
  PUBLIC_APP_NAME: z.string(),
  VAPID_PUBLIC_KEY: z.string(),
  INTERNAL_API_KEY: z.string(),
});

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
});

const processEnv = {
  ...process.env,
};

const _clientEnv = clientEnvSchema.parse(processEnv);
const _serverEnv = serverEnvSchema.parse(processEnv);

export const env = {
  ..._clientEnv,
  ..._serverEnv,
};

/**
 * Variables accesibles en el cliente. Inyéctalas en window.ENV desde el loader de root.
 */
export function getClientEnv() {
  return {
    API_URL: _clientEnv.PUBLIC_API_URL,
    VAPID_PUBLIC_KEY: _clientEnv.VAPID_PUBLIC_KEY,
    INTERNAL_API_KEY: _clientEnv.INTERNAL_API_KEY,
  };
}

/**
 * Variables accesibles en el servidor.
 */
export function getServerEnv() {
  return {
    API_URL: _clientEnv.PUBLIC_API_URL,
    VAPID_PUBLIC_KEY: _clientEnv.VAPID_PUBLIC_KEY,
    INTERNAL_API_KEY: _clientEnv.INTERNAL_API_KEY,
  };
}
