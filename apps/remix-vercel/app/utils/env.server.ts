// env.server.ts
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const clientEnvSchema = z.object({
  PUBLIC_API_URL: z.string().url().optional().default("http://localhost:3001"),
  PUBLIC_APP_NAME: z.string().optional().default("Exam Notifier"),
  VAPID_PUBLIC_KEY: z.string().optional().default(""),
  INTERNAL_API_KEY: z.string().optional().default(""),
});

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().optional().default("postgresql://localhost:5432/exam_notifier"),
  SESSION_SECRET: z.string().min(32).optional().default("default_session_secret_32_chars_long"),
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
    API_URL: process.env.PUBLIC_API_URL || "",
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
    INTERNAL_API_KEY: process.env.INTERNAL_API_KEY || "",
  };
}

export function getPublicEnv() {
  return {
    API_URL: process.env.PUBLIC_API_URL || "",
    VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY || "",
  };
}
