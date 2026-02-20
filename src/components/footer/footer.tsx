import { XIcon, LinkedInIcon, GithubIcon } from "@/components/footer/icons";
import Link from "next/link";

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

const socialLinks = [
  { icon: XIcon, href: "https://x.com/", label: "Twitter" },
  { icon: LinkedInIcon, href: "https://www.linkedin.com/", label: "LinkedIn" },
  { icon: GithubIcon, href: "https://github.com/", label: "Github" },
];

export function Footer() {
  return (
    <footer className="relative bg-black text-white overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-radial from-emerald-900/20 to-transparent blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Top section — Brand + Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 pt-20 pb-16 border-b border-white/10">
          {/* Brand */}
          <div className="md:col-span-5 flex flex-col gap-5">
            <h2 className="text-5xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              ZAD
            </h2>
            <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
              We don&apos;t just design clothes. We engineer movement. Premium
              streetwear built for those who refuse to blend in.
            </p>
            {/* Social icons */}
            <div className="flex gap-4 mt-2">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  title={social.label}
                  className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/30 transition-all duration-300 hover:bg-white/5"
                >
                  <social.icon className="h-4 w-4 fill-current" />
                </Link>
              ))}
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-3 md:col-start-7">
            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-neutral-500 mb-6">
              Navigation
            </h3>
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-black tracking-[0.2em] uppercase text-neutral-500 mb-6">
              Legal
            </h3>
            <ul className="flex flex-col gap-4">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-neutral-300 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8">
          <span className="text-neutral-500 text-xs tracking-wider">
            &copy; {new Date().getFullYear()} ZAD. All rights reserved.
          </span>
          <span className="text-neutral-600 text-xs tracking-wider uppercase">
            EST. 2026 // Genesis Edition
          </span>
        </div>
      </div>
    </footer>
  );
}
