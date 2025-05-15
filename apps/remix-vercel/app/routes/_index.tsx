import React from "react";
import { getAuth } from "@clerk/remix/ssr.server";
import {
  LoaderFunction,
  redirect,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";

import { Button } from "@exam-notifier/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@exam-notifier/ui/components/card";

import { clerkClient } from "~/utils/clerk.server";

export async function loader(args: LoaderFunctionArgs) {
  //SSR
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  // La llamada a clerk nos retrasa un poco, pero es la única forma de obtener el rol del usuario
  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (role === "admin") {
    return redirect("/admin");
  } else if (role === "profesor") {
    return redirect("/mesas");
  }

  return redirect("/sin-rol");
}

export default function Index() {
  return null; // Nunca se renderiza home, siempre redirige
}

export function ErrorBoundary() {
  const error = useRouteError();

  // `CatchBoundary` de Remix - Maneja errores de rutas
  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

  // Don't forget to typecheck with your own logic.
  // Any value can be thrown, not just errors!
  let errorMessage = "Unknown error";
  if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="relative min-h-screen bg-white sm:flex sm:items-center sm:justify-center">
      <div className="mx-auto flex max-w-2xl flex-col gap-4 rounded-md bg-slate-50 p-12">
        <h1 className="text-3xl font-bold text-slate-900">¡Ups! ...</h1>
        <p className="text-slate-700">Algo salió mal...</p>
        <pre className="overflow-scroll rounded-md border border-slate-300 bg-white p-4 text-red-500">
          {errorMessage}
        </pre>
      </div>
    </div>
  );
}
