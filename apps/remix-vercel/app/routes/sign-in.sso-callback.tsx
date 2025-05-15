import { AuthenticateWithRedirectCallback } from "@clerk/remix";

export default function SSOCallback() {
  return <AuthenticateWithRedirectCallback />;
} 