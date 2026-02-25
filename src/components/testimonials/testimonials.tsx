import { Badge } from "@/components/ui/badge";
import { TestimonialMarquee } from "@/components/testimonials/testimonial-marquee";

export type Testimonial = {
  name: string;
  date: string;
  title: string;
  content: string;
  avatar?: string;
  rating: number;
};

const testimonials = [
  {
    name: "Omar K.",
    date: "Jan 12",
    title: "Insane Quality",
    content: `"The fabric is unreal — stretchy, breathable, and looks premium. ZAD is on another level."`,
    rating: 5,
  },
  {
    name: "Sara M.",
    date: "Feb 3",
    title: "Best Streetwear Brand in Egypt",
    content: `"I've tried dozens of brands and nothing comes close. ZAD nails the balance between comfort and style."`,
    rating: 5,
  },
  {
    name: "Youssef A.",
    date: "Dec 28",
    title: "Worth Every Pound",
    content: `"Ordered three pieces and they all fit perfectly. The attention to detail is incredible for this price range."`,
    rating: 5,
  },
  {
    name: "Nour H.",
    date: "Jan 19",
    title: "Compliments Every Time",
    content: `"Every time I wear ZAD I get asked where it's from. The designs are unique and the quality speaks for itself."`,
    rating: 5,
  },
  {
    name: "Ahmed R.",
    date: "Feb 10",
    title: "The Hoodie is a Must-Have",
    content: `"The ZAD Oversize Hoodie is the heaviest, most comfortable hoodie I've ever owned. 400 GSM fleece is no joke."`,
    rating: 5,
  },
  {
    name: "Layla T.",
    date: "Jan 25",
    title: "Fast Shipping, Perfect Packaging",
    content: `"Order arrived in 2 days, beautifully packaged. You can tell ZAD cares about the whole experience, not just the clothes."`,
    rating: 5,
  },
  {
    name: "Karim S.",
    date: "Feb 7",
    title: "Finally, Real Streetwear in Egypt",
    content: `"No more importing overpriced brands. ZAD gives me the same quality and style, designed for us. Respect."`,
    rating: 5,
  },
  {
    name: "Mariam D.",
    date: "Jan 30",
    title: "Oversized Fit Done Right",
    content: `"Most brands get oversized wrong — either too boxy or too long. ZAD got the proportions perfect. I sized up and it drapes beautifully."`,
    rating: 4,
  },
] satisfies Testimonial[];

export function Testimonials() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 py-14 md:py-25 bg-background text-foreground">
      <Badge variant="secondary" className="mb-2 uppercase bg-foreground/10 text-foreground border-foreground/10 hover:bg-foreground/15">
        Testimonials
      </Badge>
      <h2 className="text-center text-4xl leading-[0.9] font-black tracking-tighter uppercase sm:text-7xl">
        Don&apos;t Take<div className="text-muted-foreground">Our Word for It</div>
      </h2>
      <p className="mb-3 max-w-lg text-center leading-6 tracking-tight sm:text-xl lg:mb-8 text-muted-foreground">
        Real talk from real people who wear ZAD every day.
      </p>
      <div className="relative w-[calc(100%+3rem)] overflow-x-hidden py-4 lg:w-full">
        <TestimonialMarquee testimonials={testimonials} className="mb-4" />
        <TestimonialMarquee testimonials={testimonials} reverse />
      </div>
    </div>
  );
}
