"use client";

import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { Menu, ShoppingBag } from "lucide-react";
import Link from "next/link";

type Props = {
  items: {
    label: string;
    href: string;
  }[];
  className?: string;
  variant?: "default" | "transparent";
};

export function MobileNav({ items, className, variant = "default" }: Props) {
  const isTransparent = variant === "transparent";
  const { totalItems } = useCart();

  return (
    <nav className={cn("flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3", className)}>
      <Link href="/" className={cn("font-bold text-2xl tracking-tighter transition-colors", isTransparent ? "text-white" : "text-black")}>
        ZAD
      </Link>
      <div className="flex items-center gap-3">
        <Link href="/cart" className={cn("relative p-2 transition-colors", isTransparent ? "text-white" : "text-black")}>
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <Drawer direction="top">
          <DrawerTrigger className="relative -m-2 cursor-pointer p-2">
            <span className="sr-only">Open menu</span>
            <Menu className={cn("h-6 w-6", isTransparent ? "text-white" : "text-black")} />
          </DrawerTrigger>
          <DrawerContent className="flex flex-col gap-4 p-8">
            <DrawerTitle className="sr-only">Menu</DrawerTitle>
            {items.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
            <Link href="/cart" className="font-medium">
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}