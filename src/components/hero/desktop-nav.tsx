"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

type Props = {
  items: {
    label: string;
    href: string;
  }[];
  className?: string;
};

export function DesktopNav({ items, className, variant = "default" }: Props & { variant?: "default" | "transparent" }) {
  const isTransparent = variant === "transparent";
  const textColor = isTransparent ? "text-white hover:text-white/80" : "text-black hover:text-black/80";
  const { totalItems } = useCart();

  return (
    <nav className={cn("mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4", className)}>
      <Link href="/" className={cn("font-bold text-2xl tracking-tighter transition-colors", isTransparent ? "text-white" : "text-black")}>
        ZAD
      </Link>
      <NavigationMenu>
        <NavigationMenuList className={cn("gap-8")}>
          {items.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink href={item.href} className={cn("text-sm font-medium hover:underline underline-offset-4 transition-colors", isTransparent ? "!text-white hover:!text-white/80" : "!text-black hover:!text-black/80")}>
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-4">
        <Link href="/cart" className={cn("relative p-2 transition-colors", isTransparent ? "text-white" : "text-black")}>
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <Button asChild className={cn("rounded-none hover:opacity-90 transition-opacity", isTransparent ? "bg-white text-black" : "bg-black text-white")}>
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
    </nav>
  );
}
