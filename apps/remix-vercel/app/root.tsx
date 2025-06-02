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
import { getRedirectUrl } from "./utils/clerk.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: fontStyles },
];

export const meta: MetaFunction = () => {
  return [
    { title: "Exam Notifier" },
    { name: "description", content: "Sistema de notificación de mesas de examen" },
  ];
};

export const loader: LoaderFunction = async (args) => {
  const auth = await rootAuthLoader(args);
  if (auth && 'userId' in auth && typeof auth.userId === 'string' && auth.userId) {
    const redirectUrl = await getRedirectUrl(auth.userId);
    return { ...auth, redirectUrl };
  }
  return auth;
};

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
  afterSignInUrl: "/",
  afterSignUpUrl: "/",
  signInUrl: "/sign-in",
  signUpUrl: "/sign-up"
});
