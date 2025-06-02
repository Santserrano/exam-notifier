import { SignIn } from "@clerk/remix";
import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Iniciar sesión | Universidad de la Cuenca del Plata" },
    {
      name: "description",
      content: "Accede al sistema de notificaciones de mesas para administradores y docentes.",
    },
  ];
};

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
              textTransform: "none",
              backgroundColor: "#00b521",
              "&:hover, &:focus, &:active": {
                backgroundColor: "#1d4ed8",
              },
            },
            headerTitle: {
              fontSize: "1.5rem",
              fontWeight: "600",
              color: "#1a1a1a",
              "@media (max-width: 640px)": {
                fontSize: "1.25rem",
              },
            },
            card: {
              width: "100%",
              maxWidth: "400px",
              margin: "0 1rem",
              "@media (max-width: 640px)": {
                margin: "0 0.5rem",
              },
            },
            header: {
              padding: "1rem",
              "@media (max-width: 640px)": {
                padding: "0.75rem",
              },
            },
          },
          layout: {
            socialButtonsPlacement: "bottom",
            socialButtonsVariant: "iconButton",
            shimmer: false,
          },
        }}
      />
    </div>
  );
}
