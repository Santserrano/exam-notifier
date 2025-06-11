import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

import diaryRouter from "./routes/diaries.js";
import diaryAcceptanceRouter from "./routes/diary.routes.js";
import notificationsRouter from "./routes/notifications.js";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? [process.env.FRONTEND_URL ?? "https://ucpmesas.site"]
      : ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "x-api-key", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Aplicar middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Rutas
app.use("/api/diaries", diaryRouter);
app.use("/api/diaries", diaryAcceptanceRouter);
app.use("/api/diaries/notificaciones", notificationsRouter);

let server: import("http").Server | undefined;

export const startServer = (): Promise<import("http").Server> => {
  return new Promise((resolve) => {
    if (process.env.NODE_ENV === "test") {
      resolve(undefined as any);
      return;
    }

    const port = process.env.PORT || 3005;

    server = app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
      resolve(server!);
    });
  });
};

export const stopServer = async (): Promise<void> => {
  if (server) {
    return new Promise((resolve, reject) => {
      server!.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
};

export { app };

if (require.main === module && process.env.NODE_ENV !== "test") {
  startServer();
}