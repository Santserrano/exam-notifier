import { createRemixStub } from "@remix-run/testing";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import MesasRoute, { loader } from "./mesas";

// Mock de useLoaderData
vi.mock("@remix-run/react", async () => {
  const actual = await vi.importActual("@remix-run/react");
  return {
    ...actual,
    useLoaderData: () => ({
      userId: "user_123",
      role: "profesor",
      mesas: [
        {
          id: 1,
          materia: "Matemática",
          carrera: "Ingeniería en sistemas",
          fecha: "5 abr.",
          fechaOriginal: "2024-04-05T08:00:00.000Z",
          modalidad: "Presencial",
          sede: "Central",
          color: "green",
        },
      ],
    }),
  };
});

// Mock de Clerk
vi.mock("@clerk/remix", () => ({
  SignOutButton: () => null,
}));

describe("MesasRoute", () => {
  it("renderiza la lista de mesas correctamente", () => {
    const RemixStub = createRemixStub([
      {
        path: "/mesas",
        Component: MesasRoute,
        loader: () => ({
          userId: "user_123",
          role: "profesor",
          mesas: [
            {
              id: 1,
              materia: "Matemática",
              carrera: "Ingeniería en sistemas",
              fecha: "5 abr.",
              fechaOriginal: "2024-04-05T08:00:00.000Z",
              modalidad: "Presencial",
              sede: "Central",
              color: "green",
            },
          ],
        }),
      },
    ]);

    render(<RemixStub initialEntries={["/mesas"]} />);

    // Verificar que se muestre el título
    expect(screen.getByText("Próximas mesas")).toBeInTheDocument();

    // Verificar que se muestre la materia
    expect(screen.getByText("Matemática")).toBeInTheDocument();

    // Verificar que se muestre la carrera
    expect(screen.getByText("Ingeniería en sistemas")).toBeInTheDocument();
  });
});
 