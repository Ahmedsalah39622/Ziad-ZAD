import type { Metadata } from "next";
import Script from "next/script";
// import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ClientOnly } from "@/components/providers/client-only";
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
  title: {
    default: "ZAD Premium Box Fit - Break Your Limits",
    template: "%s | ZAD"
  },
  description: "Redefining the modern silhouette. Premium box fit essentials engineered for those who demand structure, comfort, and uncompromising style.",
  alternates: {
    canonical: "https://zadfitt.com",
  },
  keywords: ["ZAD", "ZAD fitt", "box fit", "oversized fit", "premium streetwear", "fitness", "apparel", "clothing", "heavyweight tee", "Egypt streetwear"],
  openGraph: {
    title: "ZAD Premium Box Fit - Break Your Limits",
    description: "Redefining the modern silhouette. Premium box fit essentials engineered for those who demand structure, comfort, and uncompromising style.",
    url: "https://zadfitt.com",
    siteName: "ZAD",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZAD Premium Box Fit - Wear The Impossible",
    description: "Redefining the modern silhouette. Premium box fit essentials engineered for those who demand structure, comfort, and uncompromising style.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const whatsappNumber = await getSetting("whatsapp_number", "");

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    "name": "ZAD",
    "url": "https://zadfitt.com",
    "logo": "https://zadfitt.com/icon.svg",
    "image": "https://zadfitt.com/zad_green_shirt_studio2255.png",
    "description": "Premium box fit essentials engineered for those who demand structure, comfort, and uncompromising style.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "EG"
    },
    // Adding price range as it's a clothing store usually expected by Google
    "priceRange": "$$"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="schema-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
          strategy="beforeInteractive"
          suppressHydrationWarning
        />
        <Script
          id="app-debug"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.__DEBUG__ = true;
              console.log('[ZAD] App initialization started');
              window.addEventListener('error', (event) => {
                console.error('[ZAD] Global error:', event.error);
              });
              window.addEventListener('unhandledrejection', (event) => {
                console.error('[ZAD] Unhandled rejection:', event.reason);
              });
            `
          }}
          suppressHydrationWarning
        />
      </head>
      <body className={`antialiased`} suppressHydrationWarning>
        <ClientOnly>
          <AuthProvider>
            <CartProvider>
              {children}
              <WhatsAppWidget phoneNumber={whatsappNumber} />
            </CartProvider>
          </AuthProvider>
        </ClientOnly>
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}

