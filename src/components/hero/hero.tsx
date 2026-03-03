"use client";

import { Nav } from "@/components/hero/nav";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getSetting } from "@/lib/actions/settings-actions";
import { Hero3DShirt } from "./hero-3d-shirt";

interface HeroSettings {
  heroImage?: string;
  heroGlowHex?: string;
  heroAccentHex?: string;
  startingPrice?: string;
  badgeDotColor?: string;
  badgeTextColor?: string;
  active?: boolean;
}

export function Hero({ initialSettings }: { initialSettings?: HeroSettings | null }) {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<HeroSettings | null>(initialSettings || null);

  useEffect(() => {
    setMounted(true);

    async function fetchSettings() {
      const raw = await getSetting("new_releases_settings", JSON.stringify({
        heroImage: "/zad_green_shirt_studio.png",
        heroGlowHex: "#065f46",
        heroAccentHex: "#10b981",
        startingPrice: "L.E 599",
        badgeDotColor: "#10b981",
        badgeTextColor: "#10b981",
        active: false,
      }));
      setSettings(JSON.parse(raw));
    }
    if (!initialSettings) {
      fetchSettings();
    }
  }, [initialSettings]);

  const heroImage = settings?.heroImage || "/zad_green_shirt_studio.png";
  const glowColor = settings?.heroGlowHex || "#065f46";
  const accentColor = settings?.heroAccentHex || "#10b981";
  const startingPrice = settings?.startingPrice || "L.E 599";
  const badgeDotColor = settings?.badgeDotColor || accentColor;
  const badgeTextColor = settings?.badgeTextColor || accentColor;

  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col overflow-hidden bg-background text-foreground">

      {/* === Animated Background === */}
      {/* Main radial glow */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div
          className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] md:w-[1000px] md:h-[1000px] rounded-full blur-3xl animate-hero-pulse"
          style={{
            background: `radial-gradient(circle, ${glowColor}66 0%, ${glowColor}26 50%, transparent 100%)`
          }}
        />
      </div>
      {/* Grain overlay */}
      <div className="absolute inset-0 z-[1] opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      {/* Accent orbs */}
      <div
        className="absolute -top-20 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${accentColor}14 0%, transparent 100%)`
        }}
      />
      <div
        className="absolute bottom-0 -left-20 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${accentColor}0F 0%, transparent 100%)`
        }}
      />

      {/* === Navbar === */}
      <div className="relative w-full z-50 px-2 md:px-8 py-3 md:py-4">
        <Nav />
      </div>

      {/* === MOBILE LAYOUT === */}
      <div className="flex md:hidden flex-1 flex-col items-center justify-center px-5 pb-6 relative z-10">

        {/* Big catchy text - mobile centered */}
        <div className={`flex flex-col items-center text-center gap-5 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}>

          {/* Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/[0.06] backdrop-blur-sm border border-foreground/[0.08] rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: badgeDotColor }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: badgeDotColor }} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: badgeTextColor }}>New Drop</span>
          </div>

          {/* Product image - centered, with glow */}
          <div className="relative w-[240px] h-[240px] my-2">
            {/* Glow behind */}
            <div
              className="absolute inset-[-20%] rounded-full blur-2xl"
              style={{
                background: `radial-gradient(circle, ${accentColor}33 0%, transparent 70%)`
              }}
            />
            <div className="relative w-full h-full animate-hero-float">
              <Image
                src={heroImage}
                alt="ZAD Genesis Collection"
                fill
                className="object-contain"
                style={{
                  filter: `drop-shadow(0 15px 50px ${accentColor}59)`
                }}
                priority
              />
            </div>
          </div>

          {/* Huge headline */}
          <h1 className="text-[13vw] font-black tracking-[-0.04em] leading-[0.85]">
            <span className="block text-foreground">Break</span>
            <span className="block text-foreground">Your</span>
            <span
              className="block"
              style={{
                background: "linear-gradient(135deg, #000000 0%, #71717a 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Limits
            </span>
          </h1>

          {/* Short punchy description */}
          <p className="text-sm text-foreground max-w-[280px] leading-relaxed font-bold">
            Redefining the modern silhouette. Premium box fit essentials engineered for those who demand structure and unapologetic style.
          </p>

          {/* CTA */}
          <div className="flex flex-col gap-3 w-full max-w-[320px]">
            <Button
              className="w-full rounded-none py-7 text-xs font-black uppercase tracking-[0.2em] bg-primary text-primary-foreground hover:opacity-90 transition-all duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)] border-none"
              asChild
            >
              <Link href="/shop">Shop Collection</Link>
            </Button>
            <Button
              className="w-full rounded-none py-7 text-xs font-bold uppercase tracking-[0.15em] bg-transparent text-foreground border border-foreground/10 hover:bg-foreground/5 transition-all duration-300"
              style={{
                border: `1px solid ${accentColor}33`,
              }}
              asChild
            >
              <Link href="/#features">Explore Tech</Link>
            </Button>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-6 mt-1">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-foreground">$89</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Starting</span>
            </div>
            <div className="w-px h-8 bg-foreground/10" />
            <div className="flex flex-col items-center">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-3 h-3 fill-current" style={{ color: accentColor }} viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">2.4k reviews</span>
            </div>
            <div className="w-px h-8 bg-foreground/10" />
            <div className="flex flex-col items-center">
              <span className="text-lg font-black text-foreground">LTD</span>
              <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Edition</span>
            </div>
          </div>
        </div>
      </div>

      {/* === DESKTOP LAYOUT === */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center w-full max-w-[1440px] mx-auto px-12 relative z-10">

        {/* Massive Background Typography */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden="true">
          <div
            style={{
              background: "linear-gradient(180deg, currentColor 0%, transparent 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            className={cn(
              "text-[18vw] leading-none font-black tracking-[-0.05em] whitespace-nowrap transition-all duration-1000 ease-out",
              "text-foreground/5",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            JUST DROP
          </div>
        </div>

        {/* Desktop Content Grid */}
        <div className="relative flex flex-row items-center justify-center w-full gap-16 lg:gap-24">

          {/* Left: Text */}
          <div
            className={`flex flex-col items-start text-left gap-8 max-w-xl transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
          >
            {/* Badge */}
            <div className="flex items-center gap-2.5 px-4 py-2 bg-foreground/[0.06] backdrop-blur-sm border border-foreground/[0.08] rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: badgeDotColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: badgeDotColor }} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: badgeTextColor }}>New Release</span>
            </div>

            {/* Heading (Desktop) - Changed to div to avoid duplicate H1s for SEO, styled exactly the same */}
            <div className="text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.85]" aria-hidden="true">
              <span className="block text-foreground">Break</span>
              <span className="block text-foreground">Your</span>
              <span
                className="block mt-1"
                style={{
                  background: "linear-gradient(135deg, #000000 0%, #71717a 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Limits
              </span>
            </div>

            {/* Description */}
            <p className="text-lg font-bold text-foreground max-w-md leading-relaxed tracking-wide">
              Redefining the modern silhouette. Premium box fit essentials engineered for those who demand structure, comfort, and unapologetic style.
            </p>

            {/* CTA */}
            <div className="flex gap-6">
              <Button
                className="group relative overflow-hidden rounded-none px-12 py-8 text-sm font-black uppercase tracking-[0.25em] bg-primary text-primary-foreground transition-all duration-500 hover:shadow-[0_0_50px_rgba(52,211,153,0.3)]"
                asChild
              >
                <Link href="/shop">
                  <span className="relative z-10 transition-colors duration-500 group-hover:text-foreground">Shop Collection</span>
                  <span className="absolute inset-0 bg-background translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  <span className="absolute bottom-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-100" style={{ backgroundColor: accentColor }} />
                </Link>
              </Button>
              <Button
                className="group rounded-none px-12 py-8 text-sm font-bold uppercase tracking-[0.2em] bg-transparent text-foreground border border-foreground/10 hover:bg-foreground/5 transition-all duration-500"
                style={{
                  borderColor: `${accentColor}4D` // ~30% opacity
                }}
                asChild
              >
                <Link href="/#features">
                  <span>Explore Tech</span>
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 mt-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold text-muted-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} className="w-3.5 h-3.5 fill-current" style={{ color: accentColor }} viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[11px] text-muted-foreground font-medium">2.4k+ reviews</span>
              </div>
            </div>
          </div>

          {/* Right: Product */}
          <div
            className={`relative w-full max-w-lg lg:max-w-xl aspect-square flex items-center justify-center transition-all duration-700 delay-400 ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
              }`}
          >
            {/* Glow rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[80%] h-[80%] rounded-full border animate-hero-ring" style={{ borderColor: `${accentColor}1A` }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-[60%] h-[60%] rounded-full border animate-hero-ring-reverse" style={{ borderColor: `${accentColor}0D` }} />
            </div>

            {/* Product Image Component */}
            <Hero3DShirt image={heroImage} glowColor={accentColor} />

            {/* Price sticker */}
            <div className={`absolute bottom-12 right-0 z-20 transition-all duration-700 delay-700 ${mounted ? "opacity-100 translate-x-0 rotate-[-3deg]" : "opacity-0 translate-x-4 rotate-0"
              }`}>
              <div className="relative bg-primary px-5 py-3 shadow-xl">
                {/* Emerald accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: accentColor }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground/60 block">Starting at</span>
                <span className="text-2xl font-black text-primary-foreground">{startingPrice}</span>
                {/* Folded corner */}
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-background/20 border-l-[12px] border-l-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* === Bottom Ticker === */}
      <div className="relative w-full z-10 py-3 md:py-4 border-t border-foreground/[0.06] bg-foreground/[0.02] backdrop-blur-sm overflow-hidden shrink-0">
        <div className="flex animate-marquee gap-8 md:gap-12 items-center whitespace-nowrap text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.25em] text-muted-foreground">
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Free Shipping $100+
          </span>
          <span className="w-1 h-1 bg-muted-foreground/40 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            30-Day Returns
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Secure Checkout
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Premium Quality
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            24/7 Support
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Worldwide Delivery
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Satisfaction Guaranteed
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Eco-Friendly Packaging
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            Exclusive Designs
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          {/* Duplicate for seamless loop */}
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Free Shipping $100+
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            30-Day Returns
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            Secure Checkout
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            Premium Quality
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            24/7 Support
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Worldwide Delivery
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Satisfaction Guaranteed
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Eco-Friendly Packaging
          </span>
          <span className="w-1 h-1 bg-muted-foreground/30 rounded-full shrink-0" />
          <span className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
            Exclusive Designs
          </span>
        </div>
      </div>
    </div>
  );
}
