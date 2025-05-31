import { ClerkApp } from "@clerk/remix";
import { rootAuthLoader } from "@clerk/remix/ssr.server";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, LiveReload, useLoaderData } from "@remix-run/react";

import { customEs } from "./localizations/customEs";
import fontStyles from "./styles/font.css?url";
import tailwindStyles from "./styles/tailwind.css?url";
import { getPublicEnv } from "./utils/env.server";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStyles },
  { rel: "stylesheet", href: fontStyles },
];

export const loader = async (args: LoaderFunctionArgs) => {
  const authData = await rootAuthLoader(args);
  const env = getPublicEnv();

  if (!env.API_URL) {
    throw new Error("API_URL no está definida en las variables de entorno");
  }

  return {
    ...authData,
    ENV: env,
  };
};


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
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)}`,
          }}
        />
        <LiveReload />
      </body>
    </html>
  );
}

export default ClerkApp(App, {
  localization: customEs,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});
