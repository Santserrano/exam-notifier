import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const host = url.host;

  return json({
    status: "ok",
    timestamp: new Date().toISOString(),
    host,
  });
}; 