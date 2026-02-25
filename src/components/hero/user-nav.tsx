"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronDown, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserNav() {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    if (!session?.user) return null;

    const { name, email, image, role } = session.user;
    const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";
    const isAdmin = (role as string) === "ADMIN";

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-foreground/5 transition-colors group relative"
            >
                <div className="relative">
                    <Avatar className="h-8 w-8 border border-border group-hover:border-foreground/50 transition-colors">
                        <AvatarImage src={image || ""} alt={name || "User"} />
                        <AvatarFallback className="bg-foreground/10 text-foreground text-[10px] font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                    {isAdmin && (
                        <div className="absolute -top-1 -right-1 bg-foreground rounded-full p-0.5 border border-background shadow-lg">
                            <ShieldCheck className="w-2.5 h-2.5 text-background" />
                        </div>
                    )}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-64 z-[100] origin-top-right overflow-hidden"
                    >
                        <div className="bg-background/80 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-1.5 ring-1 ring-border/5">
                            {/* User Info Header */}
                            <div className="px-3 py-3 border-b border-border/5 mb-1">
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">Account</p>
                                <p className="text-sm font-bold text-foreground truncate">{name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{email}</p>
                            </div>

                            {/* Action Links */}
                            <div className="space-y-0.5">
                                {isAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground transition-all group"
                                    >
                                        <ShieldCheck className="w-4 h-4 text-foreground group-hover:text-background" />
                                        <span className="text-xs font-bold text-muted-foreground group-hover:text-background uppercase tracking-wider">Admin</span>
                                    </Link>
                                )}

                                <Link
                                    href="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-foreground/5 transition-all group"
                                >
                                    <User className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
                                    <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground uppercase tracking-wider">My Profile</span>
                                </Link>

                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all group text-left"
                                >
                                    <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-red-400" />
                                    <span className="text-xs font-bold text-muted-foreground group-hover:text-red-400 uppercase tracking-wider">Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
