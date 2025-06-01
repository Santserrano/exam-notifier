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
            header: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: '0.1rem',
              fontSize: 12,
            },
            formButtonPrimary: {
              fontSize: 12,
              textTransform: 'none',
              backgroundColor: '#00b521',
              '&:hover, &:focus, &:active': {
                backgroundColor: '#1d4ed8',
              },
            },
            socialButtonsBlockButton: {
              display: 'none'
            },
            footerActionLink: {
              display: 'none'
            },
            footerAction: {
              display: 'none'
            },
            dividerLine: {
              display: 'none'
            },
            dividerText: {
              display: 'none'
            },
            headerTitle: {
              marginBottom: '0.25rem'
            },
            headerSubtitle: {
              marginBottom: '0.25rem'
            },
            formField: {
              marginTop: '0.1rem'
            },
            card: {
              paddingTop: '2rem'
            }
          },
        }}
      />
    </div>
  );
}
