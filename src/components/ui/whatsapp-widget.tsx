"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

export function WhatsAppWidget({ phoneNumber }: { phoneNumber: string }) {
    const pathname = usePathname();

    // Do not render anything if there is no phone number configured
    // or if we are currently on the admin dashboard
    if (!phoneNumber || pathname.startsWith("/admin")) {
        return null;
    }

    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9+]/g, "")}`;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <Link
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle className="h-7 w-7 transition-transform duration-300 group-hover:scale-110 fill-current" />
            </Link>
        </div>
    );
}
