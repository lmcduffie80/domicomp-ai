import Link from "next/link";

export const metadata = {
  title: "Support — DomiComp AI",
  description: "Get help with DomiComp AI by Agrovus LLC",
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Support</h1>
      <p className="text-sm text-slate-400 mb-10">We&rsquo;re here to help with the DomiComp AI app and website.</p>

      <section className="space-y-8 text-sm leading-relaxed">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Contact us</h2>
          <p>
            Email{" "}
            <a href="mailto:support@domicomp-ai.com" className="text-green-700 underline">support@domicomp-ai.com</a>{" "}
            and we&rsquo;ll reply within one business day. Please include the email address on your account and,
            if it&rsquo;s about a deal, the property address.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Signing in</h2>
          <p>
            Enter your email address, then your password. If you don&rsquo;t have a password, choose
            &ldquo;Email me a code instead&rdquo; and enter the 6-digit code we send you. New accounts can be created at{" "}
            <Link href="/sign-up" className="text-green-700 underline">domicomp-ai.com/sign-up</Link>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Subscriptions and billing</h2>
          <p>
            New organizations start with a 7-day free trial. Plans are purchased and managed on our website at{" "}
            <Link href="/pricing" className="text-green-700 underline">domicomp-ai.com/pricing</Link>. Payments are processed
            securely by Stripe. To cancel or change a plan, sign in on the website or email us.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Deleting your account</h2>
          <p>
            In the app, tap <strong>Delete account</strong> next to Sign out and confirm. This permanently deletes your
            account, and for organizations where you are the only member, all deals, photos and subscription data.
            You can also request deletion by emailing{" "}
            <a href="mailto:support@domicomp-ai.com" className="text-green-700 underline">support@domicomp-ai.com</a>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Privacy</h2>
          <p>
            Read how we handle your data in our{" "}
            <Link href="/privacy" className="text-green-700 underline">Privacy Policy</Link>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Company</h2>
          <p>
            Agrovus LLC<br />
            DomiComp AI<br />
            <a href="https://domicomp-ai.com" className="text-green-700 underline">https://domicomp-ai.com</a>
          </p>
        </div>
      </section>
    </main>
  );
}
