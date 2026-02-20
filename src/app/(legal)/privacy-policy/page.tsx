import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — ZAD",
  description: "Privacy Policy for ZAD streetwear.",
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
      <p className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-500 mb-4">Legal</p>
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-10">
        Privacy Policy
      </h1>

      <div className="space-y-8 text-neutral-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">1. Information We Collect</h2>
          <p>
            When you visit our website or make a purchase, we may collect personal information including your name, email address, phone number, shipping address, and payment details. We also automatically collect browsing data such as IP address, browser type, and pages visited.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">2. How We Use Your Information</h2>
          <p>
            Your information is used to process orders, communicate with you about your purchases, improve our website experience, send marketing communications (with your consent), and comply with legal obligations. We will never sell your personal data to third parties.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">3. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. All payment transactions are encrypted using SSL technology. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">4. Cookies</h2>
          <p>
            Our website uses cookies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie preferences through your browser settings. Disabling cookies may affect certain website features.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">5. Third-Party Services</h2>
          <p>
            We may share your information with trusted third-party service providers (shipping carriers, payment processors) solely for the purpose of fulfilling your orders. These providers are contractually bound to protect your information.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">6. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information at any time. To exercise these rights, contact us at support@zad.com. We will respond to your request within 30 days.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">7. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated effective date. We encourage you to review this policy periodically.
          </p>
        </section>

        <p className="text-neutral-600 text-xs pt-4 border-t border-neutral-900">
          Last updated: February 2026
        </p>
      </div>
    </div>
  );
}
