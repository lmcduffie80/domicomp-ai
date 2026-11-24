import { SignIn } from "@clerk/react";

export function SignInScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1f17] px-4">
      {/* Brand */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-emerald-700">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-white">DomiComp AI</h1>
        <p className="mt-1 text-sm text-emerald-300">Powered by Agrovus</p>
      </div>

      <SignIn
        routing="hash"
        fallbackRedirectUrl="/"
        appearance={{
          variables: {
            colorPrimary: "#0f6b4f",
            colorBackground: "#ffffff",
            borderRadius: "0.75rem",
          },
          elements: {
            socialButtonsRoot: { display: "none" },
            dividerRow: { display: "none" },
            card: { boxShadow: "none", border: "1px solid #e2e8f0" },
          },
        }}
      />
    </div>
  );
}
