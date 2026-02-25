import { Star } from "@/components/showcase/star";
import type { Testimonial } from "@/components/testimonials/testimonials";

type Props = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: Props) {
  return (
    <div className="bg-secondary border border-border flex h-auto w-xs flex-col gap-2 rounded-xl p-7 md:w-[24rem] md:p-8">
      <div className="mb-1 text-lg font-semibold text-foreground">{testimonial.title}</div>
      <div className="mb-2 flex items-center gap-px">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} size={18} className="text-yellow-400" />
        ))}
        <span className="ps-1 text-xs text-muted-foreground">{testimonial.date}</span>
        <span className="bg-muted mx-1 h-1 w-1 rounded-full"></span>
        <span className="text-xs text-muted-foreground">{testimonial.name}</span>
      </div>
      <div className="text-sm text-wrap md:text-base md:font-medium text-foreground/80">{testimonial.content}</div>
    </div>
  );
}
