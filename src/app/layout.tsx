import type { Metadata } from "next";
// import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/components/providers/auth-provider";
import { getSetting } from "@/lib/actions/settings-actions";
import { WhatsAppWidget } from "@/components/ui/whatsapp-widget";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// const inter = Inter({
//   variable: "--font-inter",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  metadataBase: new URL("https://zadfitt.com"),
  title: "ZAD Premium Box Fit - Break Your Limits",
  description: "Redefining the modern silhouette. Premium box fit essentials engineered for those who demand structure, comfort, and unapologetic style. Every piece is built for movement, designed for impact.",
  keywords: ["ZAD", "ZAD fitt", "box fit", "oversized fit", "premium streetwear", "fitness", "apparel", "clothing", "heavyweight tee", "Egypt streetwear"],
  openGraph: {
    title: "ZAD Premium Box Fit - Break Your Limits",
    description: "Redefining the modern silhouette. Premium box fit essentials engineered for those who demand structure, comfort, and unapologetic style. Every piece is built for movement, designed for impact.",
    url: "https://zadfitt.com",
    siteName: "ZAD",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAD Premium Box Fit - Wear The Impossible",
    description: "Redefining the modern silhouette. Premium box fit essentials engineered for those who demand structure, comfort, and unapologetic style.",
  },
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
        <Analytics />
      </body>
    </html>
  );
}

