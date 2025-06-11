// server.ts
import { startServer } from "./index";
import { isMainModule } from "./utils/isMainModule";

export function runServer() {
    if (isMainModule() && process.env.NODE_ENV !== "test") {
        startServer().catch((error) => {
            console.error("Error al iniciar el servidor:", error);
            process.exit(1);
        });
    }
}

runServer();
