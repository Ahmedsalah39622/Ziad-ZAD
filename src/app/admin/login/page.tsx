"use client";

import { useState } from "react";
import { adminLoginAction } from "@/lib/actions/auth-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await adminLoginAction(email, password);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Login successful!");
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            toast.error("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-black px-4">
            <div className="w-full max-w-md space-y-8 rounded-lg border border-white/10 bg-zinc-950 p-8 shadow-2xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tighter text-white">ZAD ADMIN</h1>
                    <p className="mt-2 text-sm text-zinc-400">Enter your credentials to access the dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@zad.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="border-white/10 bg-zinc-900 text-white placeholder:text-zinc-600 focus:border-white/20 focus:ring-0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" title="password" className="text-zinc-300">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="border-white/10 bg-zinc-900 text-white focus:border-white/20 focus:ring-0"
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-white text-black hover:bg-zinc-200"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
