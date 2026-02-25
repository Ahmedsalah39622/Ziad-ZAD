"use client";

import { Drawer, DrawerContent, DrawerTrigger, DrawerTitle } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { Menu, ShoppingBag, ShieldCheck, User, LogOut } from "lucide-react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  items: {
    label: string;
    href: string;
  }[];
  className?: string;
  variant?: "default" | "transparent";
};

export function MobileNav({ items, className, variant = "default" }: Props) {
  const { data: session } = useSession();
  const user = session?.user;
  const isTransparent = variant === "transparent";
  const { totalItems } = useCart();
  const isAdmin = (user as any)?.role === "ADMIN";

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  return (
    <nav className={cn("flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3", className)}>
      <Link href="/" className={cn("font-bold text-2xl tracking-tighter transition-colors", isTransparent ? "text-white" : "text-black")}>
        ZAD
      </Link>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link
            href="/admin"
            className={cn("flex items-center justify-center size-10 rounded-full transition-colors", isTransparent ? "text-white bg-white/5" : "text-black bg-black/5")}
            title="Dashboard"
          >
            <ShieldCheck className="w-5 h-5" />
          </Link>
        )}
        {!user && (
          <Link
            href="/login"
            className={cn("p-2 transition-colors", isTransparent ? "text-white hover:text-white/80" : "text-black hover:text-black/80")}
            title="Login"
          >
            <User className="w-5 h-5" />
          </Link>
        )}
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
          <DrawerContent className="flex flex-col gap-4 p-8 bg-black border-white/10 rounded-b-3xl">
            <DrawerTitle className="sr-only">Menu</DrawerTitle>

            {user && (
              <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-2">
                <Avatar className="h-12 w-12 border border-white/10">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-emerald-500/10 text-emerald-400 font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <p className="text-white font-black uppercase tracking-widest truncate">{user.name}</p>
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-2">
              {items.map((item) => (
                <Link key={item.href} href={item.href} className="text-white text-2xl font-black uppercase tracking-tighter py-2 hover:text-emerald-400 transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-white/10 my-2" />

            <div className="flex flex-col gap-3">
              {isAdmin ? (
                <Link href="/admin" className="text-emerald-400 text-lg font-black uppercase tracking-widest flex items-center gap-4 py-2 hover:text-white transition-colors">
                  <div className="size-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  Admin
                </Link>
              ) : !user ? (
                <Link href="/login" className="text-white text-lg font-black uppercase tracking-widest flex items-center gap-3 py-2">
                  <User className="h-5 w-5" />
                  Sign In
                </Link>
              ) : null}

              {user && (
                <button
                  onClick={() => signOut()}
                  className="text-red-400 text-lg font-black uppercase tracking-widest flex items-center gap-3 py-2 text-left"
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </button>
              )}
            </div>

            <Link href="/cart" className="text-white text-lg font-bold tracking-tighter flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Cart {totalItems > 0 && `(${totalItems})`}
            </Link>
          </DrawerContent>
        </Drawer>
      </div>
    </nav>
  );
}