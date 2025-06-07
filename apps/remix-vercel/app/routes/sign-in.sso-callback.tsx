import { getAuth } from "@clerk/remix/ssr.server";
import { redirect, type LoaderFunctionArgs } from "@remix-run/node";

export async function loader(args: LoaderFunctionArgs) {
  const { userId, sessionClaims } = await getAuth(args);

  if (!userId) {
    return redirect("/sign-in");
  }

  // callback de sso
  if (sessionClaims?.role === "admin") {
    return redirect("/admin");
  } else if (sessionClaims?.role === "profesor") {
    return redirect("/mesas");
  }

  // Si no tiene rol, redirigir a sign-in
  return redirect("/sign-in");
}
