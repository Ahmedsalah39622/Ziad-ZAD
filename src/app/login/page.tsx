"use client";

import { useState, useEffect } from "react";
// loginAction is a server action; import dynamically inside the handler to avoid
// bundling server modules into the client build.
// import { loginAction } from "@/lib/actions/auth-actions";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { loginAction } = await import("@/lib/actions/auth-actions");
            const result = await loginAction(email, password);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Login successful!");
                router.push(callbackUrl);
                router.refresh();
            }
        } catch {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden bg-background text-foreground font-inter">
            {/* === Animated Background === */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full bg-gradient-radial from-foreground/10 via-foreground/5 to-transparent blur-3xl animate-hero-pulse" />
                <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-gradient-radial from-foreground/5 to-transparent rounded-full blur-3xl" />
                <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-gradient-radial from-foreground/5 to-transparent rounded-full blur-2xl opacity-50" />
            </div>

            {/* Grain overlay */}
            <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
            />

            {/* Background Typography */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                <h2
                    className={`text-[25vw] leading-none font-black tracking-[-0.05em] whitespace-nowrap transition-all duration-1000 ease-out ${mounted ? "opacity-[0.03] translate-y-0" : "opacity-0 translate-y-8"
                        }`}
                    style={{
                        background: "linear-gradient(180deg, var(--foreground) 0%, transparent 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    ZAD
                </h2>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md px-6"
            >
                <div className="text-center mb-10">
                    <Link href="/" className="inline-block text-5xl font-black tracking-[-0.05em] mb-4 group">
                        <span
                            style={{
                                background: "linear-gradient(135deg, var(--foreground) 0%, var(--muted-foreground) 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                            }}
                            className="transition-all duration-500 group-hover:opacity-80"
                        >
                            ZAD
                        </span>
                    </Link>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground">WELCOME BACK</h1>
                    <p className="mt-3 text-sm text-muted-foreground font-medium tracking-wide uppercase opacity-70">
                        Continue your journey
                    </p>
                </div>

                <div className="rounded-[2px] border border-border bg-card/40 p-8 shadow-3xl backdrop-blur-2xl relative overflow-hidden group">
                    {/* Subtle accent line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-foreground/20 to-transparent opacity-50" />

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="YOU@EXAMPLE.COM"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-14 border-border bg-foreground/[0.03] text-foreground placeholder:text-muted-foreground/40 focus:border-foreground/30 focus:bg-foreground/[0.05] transition-all duration-300 rounded-none text-sm font-medium tracking-wide"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" title="password" className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em] ml-1">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-14 border-border bg-foreground/[0.03] text-foreground focus:border-foreground/30 focus:bg-foreground/[0.05] transition-all duration-300 rounded-none text-sm font-medium tracking-wide"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full h-14 overflow-hidden rounded-none text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] active:scale-[0.98] bg-primary text-primary-foreground hover:opacity-90"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-foreground/10 to-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            {isLoading ? (
                                <Loader2 className="relative z-10 h-5 w-5 animate-spin" />
                            ) : (
                                <span className="relative z-10 flex items-center justify-center gap-2 transition-colors duration-500">
                                    Sign In <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-border/5 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                            Don&apos;t have an account?{" "}
                            <Link
                                href={`/register${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                                className="text-foreground hover:opacity-70 transition-colors duration-300 ml-1 underline underline-offset-4 decoration-foreground/20"
                            >
                                Register Now
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Secure footer */}
                <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
                    <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <span className="text-[9px] font-bold uppercase tracking-widest">Secure TLS</span>
                    </div>
                    <div className="w-[1px] h-3 bg-foreground/20" />
                    <div className="flex items-center gap-2">
                        <svg className="w-3 h-3 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span className="text-[9px] font-bold uppercase tracking-widest">End-to-End Encryption</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
