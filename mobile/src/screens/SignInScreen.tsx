import { useState } from "react";
import { useClerk } from "@clerk/react";

type Step = "email" | "code";

// Minimal type for the sign-in client resource
type ClerkSignIn = {
  create: (p: { identifier: string }) => Promise<void>;
  prepareFirstFactor: (p: { strategy: string; emailAddressId: string }) => Promise<void>;
  attemptFirstFactor: (p: { strategy: string; code: string }) => Promise<{ status: string; createdSessionId: string }>;
  supportedFirstFactors: Array<{ strategy: string; emailAddressId: string }> | null | undefined;
};

export function SignInScreen() {
  const clerk = useClerk();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getSignIn(): ClerkSignIn | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (clerk as any).client?.signIn ?? null;
  }

  async function handleSendCode() {
    const si = getSignIn();
    if (!si || !email.trim()) return;
    setLoading(true); setError(null);
    try {
      await si.create({ identifier: email.trim() });
      const factor = si.supportedFirstFactors?.find(f => f.strategy === "email_code");
      if (factor) {
        await si.prepareFirstFactor({ strategy: "email_code", emailAddressId: factor.emailAddressId });
      }
      setStep("code");
    } catch (e) {
      const err = e as { errors?: { message: string }[]; message?: string };
      setError(err.errors?.[0]?.message ?? err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    const si = getSignIn();
    if (!si || !code.trim()) return;
    setLoading(true); setError(null);
    try {
      const result = await si.attemptFirstFactor({ strategy: "email_code", code: code.trim() });
      if (result.status === "complete") {
        await clerk.setActive({ session: result.createdSessionId });
      }
    } catch (e) {
      const err = e as { errors?: { message: string }[]; message?: string };
      setError(err.errors?.[0]?.message ?? err.message ?? "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d1f17] px-6">
      {/* Brand */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-emerald-700 shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
            <path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">DomiComp AI</h1>
        <p className="mt-1 text-sm text-emerald-300">Powered by Agrovus</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-xl">
        {step === "email" ? (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Sign in</h2>
            <p className="text-sm text-gray-500 mb-6">We'll send a code to your email</p>

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
            <input
              type="email"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSendCode()}
              onClick={e => (e.target as HTMLInputElement).focus()}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <button
              onClick={handleSendCode}
              disabled={loading || !email.trim()}
              className="mt-5 w-full rounded-xl bg-green-800 py-3.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? "Sending…" : "Continue →"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setStep("email"); setCode(""); setError(null); }}
              className="mb-5 text-xs text-gray-400 flex items-center gap-1"
            >
              ← Back
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Check your email</h2>
            <p className="text-sm text-gray-500 mb-6">
              We sent a 6-digit code to <span className="font-medium text-gray-700">{email}</span>
            </p>

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={e => e.key === "Enter" && handleVerify()}
              placeholder="000000"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-2xl font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <button
              onClick={handleVerify}
              disabled={loading || code.length < 6}
              className="mt-5 w-full rounded-xl bg-green-800 py-3.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? "Verifying…" : "Sign in →"}
            </button>

            <button onClick={handleSendCode} className="mt-3 w-full text-xs text-gray-400 py-2">
              Resend code
            </button>
          </>
        )}
      </div>

      <p className="mt-6 text-xs text-emerald-700">Secured by Clerk</p>
    </div>
  );
}
