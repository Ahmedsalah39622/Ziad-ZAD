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

export function DesktopNav({ items, className }: Props) {
  const { data: session } = useSession();
  const user = session?.user;
  const { totalItems } = useCart();
  const isAdmin = (user as { role?: string })?.role === "ADMIN";

  return (
    <nav className={cn("mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4", className)}>
      <Link href="/" className={cn("font-bold text-2xl tracking-tighter transition-colors", "text-foreground")}>
        Z A D
      </Link>
      <NavigationMenu className="mx-auto">
        <NavigationMenuList className={cn("gap-10")}>
          {items.map((item) => (
            <NavigationMenuItem key={item.href}>
              <NavigationMenuLink href={item.href} className={cn("text-xs font-black uppercase tracking-[0.2em] hover:opacity-70 transition-colors", "!text-foreground")}>
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
              "bg-foreground/5 border-foreground/10 text-foreground hover:bg-foreground hover:border-foreground hover:text-background"
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
              "bg-foreground/[0.03] border border-foreground/[0.08] hover:border-foreground/20 backdrop-blur-md",
              "text-[10px] font-black uppercase tracking-[0.2em]",
              "text-foreground"
            )}
          >
            <User className="w-3.5 h-3.5 text-foreground" />
            <span>Login</span>
          </Link>
        ) : (
          <UserNav />
        )}

        <Link href="/cart" className={cn("relative p-2 transition-colors", "text-foreground")}>
          <ShoppingBag className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-foreground text-background text-[10px] font-bold rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <Button asChild className={cn("rounded-none hover:opacity-90 transition-opacity", "bg-primary text-primary-foreground")}>
          <Link href="/shop">Shop Now</Link>
        </Button>
      </div>
    </nav>
  );
}
