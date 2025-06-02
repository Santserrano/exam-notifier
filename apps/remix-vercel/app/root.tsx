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
} from "@remix-run/react";

import fontStyles from "./styles/font.css?url";
import tailwindStyles from "./styles/tailwind.css?url";
import { customEs } from "./localizations/customEs";

export const loader: LoaderFunction = rootAuthLoader;

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
  return (
    <html lang="es" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Outlet />
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
