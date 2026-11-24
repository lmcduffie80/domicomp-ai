export const metadata = {
  title: "Privacy Policy — DomiComp AI",
  description: "Privacy Policy for DomiComp AI by Agrovus LLC",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mb-10">Last updated: November 24, 2026</p>

      <section className="space-y-8 text-sm leading-relaxed">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">1. Introduction</h2>
          <p>
            DomiComp AI ("we," "our," or "us") is operated by Agrovus LLC. This Privacy Policy explains how we collect,
            use, and protect your information when you use the DomiComp AI mobile application and web platform
            (collectively, the "Service").
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> Name and email address provided during sign-up via Clerk authentication.</li>
            <li><strong>Organization Information:</strong> Company name and member information for team accounts.</li>
            <li><strong>Deal Data:</strong> Property addresses, photos, rehab estimates, comparable sales, and financial figures you enter into the app.</li>
            <li><strong>Property Photos:</strong> Images you capture or upload for AI-powered condition analysis.</li>
            <li><strong>Payment Information:</strong> Subscription billing is handled securely by Stripe. We do not store credit card numbers.</li>
            <li><strong>Usage Data:</strong> App interactions, feature usage, and device information for improving the Service.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve the DomiComp AI Service</li>
            <li>To analyze property photos using AI and return condition assessments</li>
            <li>To process subscription payments via Stripe</li>
            <li>To send transactional emails (account confirmation, subscription receipts)</li>
            <li>To provide customer support</li>
            <li>To comply with legal obligations</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">4. Camera and Photo Library Access</h2>
          <p>
            DomiComp AI requests access to your device's camera and photo library solely to allow you to capture and
            upload property photos for deal analysis. Photos are uploaded to secure cloud storage and processed by our
            AI system. We do not share your photos with third parties except as required to provide the Service.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">5. Data Sharing</h2>
          <p>We do not sell your personal data. We share data only with:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Clerk</strong> — authentication and user management</li>
            <li><strong>Stripe</strong> — payment processing</li>
            <li><strong>OpenAI / AI providers</strong> — photo analysis and property intelligence (data is not retained by providers for training)</li>
            <li><strong>Vercel</strong> — cloud hosting and infrastructure</li>
            <li><strong>Resend</strong> — transactional email delivery</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">6. Data Retention</h2>
          <p>
            Your deal data, photos, and account information are retained as long as your account is active. You may
            delete your account and associated data at any time by contacting us at{" "}
            <a href="mailto:support@domicomp.ai" className="text-green-700 underline">support@domicomp.ai</a>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">7. Security</h2>
          <p>
            We implement industry-standard security measures including encrypted data transmission (HTTPS/TLS),
            secure cloud storage, and access controls. No method of transmission over the internet is 100% secure,
            and we cannot guarantee absolute security.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">8. Children's Privacy</h2>
          <p>
            DomiComp AI is not directed to children under 13. We do not knowingly collect personal information
            from children under 13.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">9. Your Rights</h2>
          <p>
            Depending on your location, you may have rights to access, correct, or delete your personal data.
            To exercise these rights, contact us at{" "}
            <a href="mailto:support@domicomp.ai" className="text-green-700 underline">support@domicomp.ai</a>.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes via
            email or an in-app notice. Continued use of the Service after changes constitutes acceptance.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">11. Contact Us</h2>
          <p>
            Agrovus LLC<br />
            DomiComp AI<br />
            <a href="mailto:support@domicomp.ai" className="text-green-700 underline">support@domicomp.ai</a><br />
            <a href="https://domicomp.ai" className="text-green-700 underline">https://domicomp.ai</a>
          </p>
        </div>
      </section>
    </main>
  );
}
