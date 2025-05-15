import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/remix";

export function HeaderClerk() {
  return (
    <header className="flex items-center justify-between border-b bg-white p-4">
      <div>
        <SignedIn>
          <UserButton afterSignOutUrl="/sign-in" />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="text-sm font-semibold">Iniciar sesión</button>
          </SignInButton>
        </SignedOut>
      </div>
      <img src="/icon-ucp.png" alt="Logo" className="h-12 w-12" />
    </header>
  );
}

export default HeaderClerk;
