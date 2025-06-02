import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export const loader: LoaderFunction = async () => {
  return json({
    ENV: {
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      API_URL: process.env.API_URL,
      INTERNAL_API_KEY: process.env.INTERNAL_API_KEY,
    },
  });
};

export default function Env() {
  const { ENV } = useLoaderData<typeof loader>();
  return null;
} 