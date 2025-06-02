import { getAuth } from "@clerk/remix/ssr.server";
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  const { userId, sessionClaims } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  // Redirigir directamente según el rol
  if (sessionClaims?.role === "admin") {
    return redirect("/admin");
  } else if (sessionClaims?.role === "profesor") {
    return redirect("/mesas");
  }

  // Si no tiene rol, redirigir a la página de sin rol
  return redirect("/sin-rol");
}

export default function SSOCallback() {
  return null;
}
