"use client";

import { MobileNav } from "@/components/hero/mobile-nav";
import { DesktopNav } from "@/components/hero/desktop-nav";

import { Ribbon } from "@/components/ui/ribbon";

const navItems = [
  {
    label: "Shop",
    href: "/shop",
  },
  {
    label: "About",
    href: "/about",
  },
  {
    label: "Features",
    href: "/#features",
  },
];

export function Nav() {
  return (
    <div className="flex flex-col w-full">
      <div className="w-full">
        <MobileNav className="flex md:hidden" items={navItems} />
        <DesktopNav className="hidden md:flex" items={navItems} />
      </div>
      <Ribbon />
    </div>
  );
}
