import { http, HttpResponse } from "msw";

export const handlers = [
  // Simular la respuesta de la API de mesas
  http.get("http://localhost:3001/api/diaries", () => {
    return HttpResponse.json([
      {
        id: 1,
        materia: "Matemática",
        carrera: "Ingeniería en sistemas",
        fecha: "2024-04-05T08:00:00.000Z",
        modalidad: "Presencial",
        sede: "Central",
      },
      {
        id: 2,
        materia: "Física",
        carrera: "Ingeniería en sistemas",
        fecha: "2024-04-10T14:00:00.000Z",
        modalidad: "Virtual",
        sede: "Virtual",
      },
    ]);
  }),

  // Simular la respuesta de Clerk para autenticación
  http.get("https://api.clerk.dev/v1/users/:userId", () => {
    return HttpResponse.json({
      id: "user_123",
      publicMetadata: {
        role: "profesor",
      },
    });
  }),
];
