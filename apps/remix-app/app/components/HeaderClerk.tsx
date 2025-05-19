import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/remix";
import { ActivarNotificaciones } from './ActivarNotificaciones';

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
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <ActivarNotificaciones />
        </div>
        <img src="/icon-ucp.png" alt="Logo" className="h-12 w-12" />
      </div>
    </header>
  );
}
export default HeaderClerk;

