import { useState } from "react";
import { useClerk } from "@clerk/react";

type Step = "email" | "password" | "code";

type SignInResult = { status: string; createdSessionId: string };

// Minimal type for the sign-in client resource
type ClerkSignIn = {
  create: (p: { identifier: string }) => Promise<ClerkSignIn>;
  prepareFirstFactor: (p: { strategy: string; emailAddressId: string }) => Promise<void>;
  attemptFirstFactor: (p: { strategy: "email_code"; code: string } | { strategy: "password"; password: string }) => Promise<SignInResult>;
  supportedFirstFactors: Array<{ strategy: string; emailAddressId?: string }> | null | undefined;
};

function errorMessage(e: unknown, fallback: string) {
  const err = e as { errors?: { message: string; longMessage?: string }[]; message?: string };
  return err.errors?.[0]?.longMessage ?? err.errors?.[0]?.message ?? err.message ?? fallback;
}

export function SignInScreen() {
  const clerk = useClerk();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function getSignIn(): ClerkSignIn | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (clerk as any).client?.signIn ?? null;
  }

  async function finish(result: SignInResult) {
    if (result.status === "complete") {
      await clerk.setActive({ session: result.createdSessionId });
    } else {
      setError("Additional verification is required. Use the emailed code instead.");
    }
  }

  async function sendCode(si: ClerkSignIn) {
    const factor = si.supportedFirstFactors?.find(f => f.strategy === "email_code");
    if (factor?.emailAddressId) {
      await si.prepareFirstFactor({ strategy: "email_code", emailAddressId: factor.emailAddressId });
    }
    setStep("code");
  }

  async function handleContinue() {
    const si = getSignIn();
    if (!si || !email.trim()) return;
    setLoading(true); setError(null);
    try {
      const created = await si.create({ identifier: email.trim() });
      if (created.supportedFirstFactors?.some(f => f.strategy === "password")) {
        setStep("password");
      } else {
        await sendCode(created);
      }
    } catch (e) {
      setError(errorMessage(e, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    const si = getSignIn();
    if (!si) return;
    setLoading(true); setError(null);
    try {
      await sendCode(si);
    } catch (e) {
      setError(errorMessage(e, "Could not send a code"));
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword() {
    const si = getSignIn();
    if (!si || !password) return;
    setLoading(true); setError(null);
    try {
      await finish(await si.attemptFirstFactor({ strategy: "password", password }));
    } catch (e) {
      setError(errorMessage(e, "Incorrect password"));
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify() {
    const si = getSignIn();
    if (!si || !code.trim()) return;
    setLoading(true); setError(null);
    try {
      await finish(await si.attemptFirstFactor({ strategy: "email_code", code: code.trim() }));
    } catch (e) {
      setError(errorMessage(e, "Invalid code"));
    } finally {
      setLoading(false);
    }
  }

  function backToEmail() {
    setStep("email"); setCode(""); setPassword(""); setError(null);
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
            <p className="text-sm text-gray-500 mb-6">Enter the email you use for DomiComp AI</p>

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email address</label>
            <input
              type="email"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleContinue()}
              onClick={e => (e.target as HTMLInputElement).focus()}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <button
              onClick={handleContinue}
              disabled={loading || !email.trim()}
              className="mt-5 w-full rounded-xl bg-green-800 py-3.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? "Checking…" : "Continue →"}
            </button>
          </>
        ) : step === "password" ? (
          <>
            <button onClick={backToEmail} className="mb-5 text-xs text-gray-400 flex items-center gap-1">
              ← Back
            </button>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Enter your password</h2>
            <p className="text-sm text-gray-500 mb-6">
              Signing in as <span className="font-medium text-gray-700">{email}</span>
            </p>

            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Password</label>
            <input
              type="password"
              autoCapitalize="none"
              autoCorrect="off"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handlePassword()}
              onClick={e => (e.target as HTMLInputElement).focus()}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
            />

            {error && <p className="mt-3 text-xs text-red-500">{error}</p>}

            <button
              onClick={handlePassword}
              disabled={loading || !password}
              className="mt-5 w-full rounded-xl bg-green-800 py-3.5 text-sm font-semibold text-white disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? "Signing in…" : "Sign in →"}
            </button>

            <button onClick={handleSendCode} disabled={loading} className="mt-3 w-full text-xs text-gray-400 py-2">
              Email me a code instead
            </button>
          </>
        ) : (
          <>
            <button onClick={backToEmail} className="mb-5 text-xs text-gray-400 flex items-center gap-1">
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
