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
import { ShoppingBag, ShieldCheck, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserNav } from "@/components/hero/user-nav";

type Props = {
  items: {
    label: string;
    href: string;
  }[];
  className?: string;
};

export function DesktopNav({ items, className, variant = "default" }: Props & { variant?: "default" | "transparent" }) {
  const { data: session } = useSession();
  const user = session?.user;
  const isTransparent = variant === "transparent";
  const { totalItems } = useCart();
  const isAdmin = (user as any)?.role === "ADMIN";

  return (
    <nav className={cn("mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4", className)}>
      <Link href="/" className={cn("font-bold text-2xl tracking-tighter transition-colors", isTransparent ? "text-white" : "text-black")}>
        ZAD
      </Link>
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className={cn("gap-10")}>
          {items.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink href={item.href} className={cn("text-xs font-black uppercase tracking-[0.2em] hover:text-emerald-400 transition-colors", isTransparent ? "!text-white" : "!text-black")}>
                {item.label}
              </NavigationMenuLink>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-5">
        {isAdmin && (
          <Button
            asChild
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full size-10 transition-all duration-300",
              isTransparent
                ? "bg-white/5 border-white/10 text-white hover:bg-emerald-500 hover:border-emerald-500 hover:text-white"
                : "bg-black/5 border-black/10 text-black hover:bg-emerald-600 hover:border-emerald-600 hover:text-white"
            )}
            title="Admin Dashboard"
          >
            <Link href="/admin">
              <ShieldCheck className="w-5 h-5" />
            </Link>
          </Button>
        )}

        {!user ? (
          <Link
            href="/login"
            className={cn(
              "group relative flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-500 overflow-hidden shrink-0",
              "bg-white/[0.03] border border-white/[0.08] hover:border-white/20 backdrop-blur-md",
              "text-[10px] font-black uppercase tracking-[0.2em]",
              isTransparent ? "text-white" : "text-black border-black/10 bg-black/[0.03] hover:bg-black/5"
            )}
          >
            <User className="w-3.5 h-3.5 text-emerald-400" />
            <span>Login</span>
          </Link>
        ) : (
          <UserNav />
        )}

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
