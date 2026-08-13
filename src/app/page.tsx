import { FAQs } from "@/components/faqs/faqs";
import { Features, type FeatureSetting } from "@/components/features/features";
import { Footer } from "@/components/footer/footer";
import { Hero } from "@/components/hero/hero";
import { Quote } from "@/components/quote/quote";
import { Showcase } from "@/components/showcase/showcase";
import { Testimonials } from "@/components/testimonials/testimonials";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { getSetting } from "@/lib/actions/settings-actions";
import { getProducts } from "@/lib/actions/product-actions";
import { FeaturedCategory } from "@/components/home/featured-category";
import type { Product, Category } from "@prisma/client";

type ProductWithCategory = Product & { category: Category | null };

// Cache for 10 minutes (instead of force-dynamic which kills caching)
export const revalidate = 600;

export default async function Home() {
  let settings: { [key: string]: FeatureSetting } = {};
  let newReleasesSettings: Record<string, unknown> = {};
  let flexiStyleProducts: ProductWithCategory[] = [];

  try {
    const settingsRaw = await getSetting("feature_settings", "{}");
    settings = JSON.parse(settingsRaw);
  } catch (error) {
    console.error("Failed to fetch feature settings:", error);
    settings = {};
  }

  try {
    const newReleasesRaw = await getSetting("new_releases_settings", JSON.stringify({
      heroImage: "/zad_green_shirt_studio.png",
      heroGlowHex: "#065f46",
      heroAccentHex: "#10b981",
      startingPrice: "L.E 599",
      badgeDotColor: "#10b981",
      badgeTextColor: "#10b981",
      active: false,
    }));
    newReleasesSettings = JSON.parse(newReleasesRaw);
  } catch (error) {
    console.error("Failed to fetch new releases settings:", error);
    newReleasesSettings = {
      heroImage: "/zad_green_shirt_studio.png",
      heroGlowHex: "#065f46",
      heroAccentHex: "#10b981",
      startingPrice: "L.E 599",
      badgeDotColor: "#10b981",
      badgeTextColor: "#10b981",
      active: false,
    };
  }

  try {
    const allProducts = await getProducts({ sort: "featured" });
    flexiStyleProducts = allProducts
      .filter(p => p.active !== false)
      .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
      .slice(0, 10);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    flexiStyleProducts = [];
  }

  return (
    <SmoothScroll>
      <Hero initialSettings={newReleasesSettings} />
      <ScrollReveal>
        <FeaturedCategory title="ZAD Editions" products={flexiStyleProducts} />
      </ScrollReveal>
      <ScrollReveal>
        <Showcase />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <Quote />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <Features settings={settings} />
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
