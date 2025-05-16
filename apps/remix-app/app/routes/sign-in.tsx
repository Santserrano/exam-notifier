import { SignIn } from "@clerk/remix";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={{
          elements: {
            formButtonPrimary: {
              fontSize: 14,
              textTransform: 'none',
              backgroundColor: '##00b521',
              '&:hover, &:focus, &:active': {
                backgroundColor: '#1d4ed8',
              },
            },
            signIn: {
              start: {
                title: 'Acceso a la Plataforma UCP',
                subtitle: '¡Bienvenido de nuevo! Por favor, inicia sesión para continuar',
                actionText: 'O usa tu correo electrónico',
              },
            },
          },
        }}
      />
    </div>
  );
}
