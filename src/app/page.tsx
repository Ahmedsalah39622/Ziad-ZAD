"use client";

import { FAQs } from "@/components/faqs/faqs";
import { Features } from "@/components/features/features";
import { Footer } from "@/components/footer/footer";
import { Hero } from "@/components/hero/hero";
import { Quote } from "@/components/quote/quote";
import { Showcase } from "@/components/showcase/showcase";
import { Testimonials } from "@/components/testimonials/testimonials";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { useRedirectWarning } from "@/lib/redirect";

export default function Home() {
  useRedirectWarning();

  return (
    <SmoothScroll>
      <Hero />
      <ScrollReveal>
        <Showcase />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <Quote />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <Features />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <Testimonials />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <FAQs />
      </ScrollReveal>
      <ScrollReveal>
        <Footer />
      </ScrollReveal>
    </SmoothScroll>
  );
}
