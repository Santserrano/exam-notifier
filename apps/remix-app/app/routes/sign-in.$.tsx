import { SignIn } from "@clerk/remix";

export default function SignInCatchAll() {
  return <SignIn afterSignInUrl="/" />;
}
