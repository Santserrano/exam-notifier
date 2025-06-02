import { getAuth } from "@clerk/remix/ssr.server";
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { isRouteErrorResponse, useRouteError } from "@remix-run/react";

import { clerkClient } from "~/utils/clerk.server";
import { HeaderClerk } from "~/components/HeaderClerk";

export async function loader(args: LoaderFunctionArgs) {
  const { userId } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  const user = await clerkClient.users.getUser(userId);
  const role = user.publicMetadata.role;

  if (!role) {
    return redirect("/sin-rol");
  }

  return redirect(role === "admin" ? "/admin" : "/mesas");
}

export default function Index() {
  return null;
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops</h1>
        <p>Status: {error.status}</p>
        <p>{error.data.message}</p>
      </div>
    );
  }

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
