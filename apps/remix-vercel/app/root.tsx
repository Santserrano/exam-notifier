import { ClerkApp } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import type { LinksFunction, LoaderFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  LiveReload,
  useLoaderData,
} from "@remix-run/react";

import fontStyles from "./styles/font.css?url";
import tailwindStyles from "./styles/tailwind.css?url";
import { customEs } from "./localizations/customEs";

export const loader: LoaderFunction = async (args) => {
  const authData = await rootAuthLoader(args);
  return {
    ...authData,
    ENV: {
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      API_URL: process.env.API_URL,
      INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    },
  };
};

export const meta: MetaFunction = () => {
  return [
    { title: "Universidad de la Cuenca del Plata - Sistema de Notificaciones" },
    {
      name: "description",
      content: "Sistema de Notificaciones de Mesas para la Universidad de la Cuenca del Plata",
    },
  ];
};

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: fontStyles },
];

function App() {
  const { ENV } = useLoaderData<typeof loader>();
  return (
    <html lang="es" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet context={{ ENV }} />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App, {
  publishableKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  localization: customEs,
});
