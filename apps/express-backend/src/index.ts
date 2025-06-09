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

// Aplicar CORS antes de cualquier middleware
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

export const startServer = () => {
  return new Promise<import("http").Server>((resolve) => {
    if (process.env.NODE_ENV === "test") {
      resolve(undefined as any);
      return;
    }

    const port = process.env.PORT || 3005;
    console.log("🟢 Iniciando servidor...");

    server = app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
      resolve(server!);
    });
  });
};

// Iniciar el servidor solo si no estamos en modo test
if (process.env.NODE_ENV !== "test") {
  startServer();
}

export { app };
