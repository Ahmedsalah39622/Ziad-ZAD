import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy — ZAD",
  description: "Refund and Return Policy for ZAD streetwear.",
};

export default function RefundPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 md:py-28">
      <p className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-500 mb-4">Legal</p>
      <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none mb-10">
        Refund Policy
      </h1>

      <div className="space-y-8 text-neutral-400 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">1. Return Window</h2>
          <p>
            We offer a 30-day return policy from the date of delivery. Items must be returned in their original, unworn condition with all tags attached and in the original packaging.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">2. Eligible Items</h2>
          <p>
            All regular-priced items are eligible for return or exchange. Items marked as &quot;Final Sale&quot; or &quot;Limited Edition&quot; cannot be returned or exchanged. Gift cards and accessories (hats, caps) are non-refundable once tags are removed.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">3. How to Initiate a Return</h2>
          <p>
            To start a return, contact us at support@zad.com with your order number and reason for return. Our team will provide you with a return authorization and shipping instructions within 24 hours. Please do not ship items back without prior authorization.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">4. Refund Process</h2>
          <p>
            Once we receive and inspect your returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed within 5–7 business days to your original payment method. For COD orders, refunds will be issued via bank transfer.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">5. Exchanges</h2>
          <p>
            If you need a different size or color, we offer free exchanges on all eligible items. Contact us with your order number and preferred exchange, and we will arrange the swap. Exchanges are subject to availability.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">6. Damaged or Defective Items</h2>
          <p>
            If you receive a damaged or defective product, contact us within 48 hours of delivery with photos of the damage. We will arrange a free replacement or full refund immediately — no return required.
          </p>
        </section>

        <section>
          <h2 className="text-white font-bold text-lg uppercase tracking-wider mb-3">7. Return Shipping</h2>
          <p>
            Return shipping costs are the responsibility of the customer unless the return is due to a ZAD error (wrong item, defective product). We recommend using a trackable shipping method for your protection.
          </p>
        </section>

        <p className="text-neutral-600 text-xs pt-4 border-t border-neutral-900">
          Last updated: February 2026
        </p>
      </div>
    </div>
  );
}
