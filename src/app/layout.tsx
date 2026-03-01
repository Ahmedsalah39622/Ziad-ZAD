import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/components/providers/auth-provider";
import { getSetting } from "@/lib/actions/settings-actions";
import { WhatsAppWidget } from "@/components/ui/whatsapp-widget";
import "./globals.css";

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "ZAD Premium Streetwear",
  description: "Premium streetwear engineered for those who refuse to blend in. Every piece is built for movement, designed for impact.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber = await getSetting("whatsapp_number", "");

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`}>
        <AuthProvider>
          <CartProvider>
            {children}
            <WhatsAppWidget phoneNumber={whatsappNumber} />
          </CartProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

