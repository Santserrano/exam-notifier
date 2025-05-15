import { SignOutButton } from "@clerk/remix";
import { getAuth } from "@clerk/remix/ssr.server";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { Button } from "@exam-notifier/ui/components/button";

export const loader = async (args: LoaderFunctionArgs) => {
  const { userId } = await getAuth(args);

  if (!userId) {
    return json({ userId: null });
  }

  return json({ userId });
};

export default function SinRolPage() {
  const { userId } = useLoaderData<typeof loader>();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold text-green-900">
        No tienes un rol asignado
      </h1>
      <p className="text-center text-gray-600">
        Por favor, contacta al administrador para que te asigne un rol.
      </p>
      {userId && (
        <SignOutButton>
          <Button>Cerrar sesión</Button>
        </SignOutButton>
      )}
    </div>
  );
} 