import { MobileNav } from "@/components/hero/mobile-nav";
import { DesktopNav } from "@/components/hero/desktop-nav";

const navItems = [
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "Features",
    href: "/#features",
  },
];

export function Nav({ variant = "transparent" }: { variant?: "default" | "transparent" }) {
  return (
    <>
      <MobileNav className="flex md:hidden" items={navItems} variant={variant} />
      <DesktopNav className="hidden md:flex" items={navItems} variant={variant} />
    </>
  );
}
