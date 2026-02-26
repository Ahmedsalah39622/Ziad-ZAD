import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions — ZAD",
  description: "Terms and Conditions for ZAD streetwear.",
};

export default function TermsAndConditions() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
      <p className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-500 mb-4">Legal</p>
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-10">
        Terms &amp; Conditions
      </h1>

      <div className="space-y-8 text-neutral-600 text-sm leading-relaxed">
        <section>
          <h2 className="text-foreground font-bold text-lg uppercase tracking-wider mb-3">1. Overview</h2>
          <p>
            These Terms &amp; Conditions govern your use of the ZAD website and the purchase of products from our online store. By accessing or using our website, you agree to be bound by these terms. If you do not agree, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold text-lg uppercase tracking-wider mb-3">2. Products &amp; Pricing</h2>
          <p>
            All product descriptions, images, and pricing are as accurate as possible. However, we do not warrant that product descriptions or prices are error-free. Prices are listed in Egyptian Pounds (L.E) and are subject to change without notice. We reserve the right to modify or discontinue any product at any time.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold text-lg uppercase tracking-wider mb-3">3. Orders &amp; Payment</h2>
          <p>
            By placing an order, you are making an offer to purchase a product. We reserve the right to accept or decline your order for any reason. Payment can be made via credit/debit card or cash on delivery (COD). All payments are processed securely and your financial information is never stored on our servers.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold text-lg uppercase tracking-wider mb-3">4. Shipping &amp; Delivery</h2>
          <p>
            Orders within Egypt typically arrive in 3–5 business days. International orders take 7–14 business days depending on location. Shipping costs are calculated at checkout. Orders over L.E 1,000 qualify for free domestic shipping. ZAD is not responsible for delays caused by customs or postal services.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold text-lg uppercase tracking-wider mb-3">5. Intellectual Property</h2>
          <p>
            All content on this website — including designs, logos, graphics, text, and images — is the property of ZAD and is protected by copyright and trademark laws. Unauthorized use, reproduction, or distribution of any content is strictly prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold text-lg uppercase tracking-wider mb-3">6. Limitation of Liability</h2>
          <p>
            ZAD shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid for the product in question.
          </p>
        </section>

        <section>
          <h2 className="text-foreground font-bold text-lg uppercase tracking-wider mb-3">7. Changes to Terms</h2>
          <p>
            We reserve the right to update these Terms &amp; Conditions at any time. Changes will be posted on this page with an updated effective date. Continued use of our website after any changes constitutes acceptance of the new terms.
          </p>
        </section>

        <p className="text-neutral-400 text-xs pt-4 border-t border-neutral-100">
          Last updated: February 2026
        </p>
      </div>
    </div>
  );
}
