import Link from "next/link";
import Image from "next/image";
import { FooterSocials } from "@/components/footer/footer-socials";

const navLinks = [
  { label: "Features", href: "/#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Shop", href: "/shop" },
];

const legalLinks = [
  { label: "Terms & Conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Refund Policy", href: "/refund-policy" },
];

export function Footer() {
  return (
    <footer className="relative bg-background text-foreground overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-foreground/5 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Top section — Brand + Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pt-20 pb-16 border-b border-foreground/10">
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              Z A D
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              We don&apos;t just design clothes. We engineer movement. Premium
              streetwear built for those who refuse to blend in.
            </p>
            {/* Social icons */}
            <FooterSocials />

            {/* Payment Methods */}
            <div className="flex flex-wrap items-center gap-6 mt-4">
              <Image
                src="/payment-methods.png"
                alt="Payment Methods"
                width={160}
                height={32}
                className="h-8 w-auto object-contain pointer-events-none"
              />
              <Image
                src="/cash-on-delivery.png"
                alt="Cash on Delivery"
                width={80}
                height={32}
                className="h-8 w-auto object-contain pointer-events-none"
              />
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-3 md:col-start-7">
            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Navigation
            </h3>
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Legal
            </h3>
            <ul className="flex flex-col gap-4">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8">
          <span className="text-muted-foreground text-xs tracking-wider">
            &copy; {new Date().getFullYear()} ZAD. All rights reserved.
          </span>

          <span className="text-muted-foreground/60 text-xs tracking-wider uppercase">
            EST. 2026 // Genesis Edition
          </span>
        </div>
      </div>
    </footer>
  );
}
