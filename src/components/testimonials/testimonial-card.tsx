import { Star } from "@/components/showcase/star";
import type { Testimonial } from "@/components/testimonials/testimonials";

type Props = {
  testimonial: Testimonial;
};

export function TestimonialCard({ testimonial }: Props) {
  return (
    <div className="bg-neutral-900 border border-neutral-700 flex h-auto w-xs flex-col gap-2 rounded-xl p-7 md:w-[24rem] md:p-8">
      <div className="mb-1 text-lg font-semibold text-white">{testimonial.title}</div>
      <div className="mb-2 flex items-center gap-px">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} size={18} className="text-yellow-400" />
        ))}
        <span className="ps-1 text-xs text-neutral-400">{testimonial.date}</span>
        <span className="bg-neutral-500 mx-1 h-1 w-1 rounded-full"></span>
        <span className="text-xs text-neutral-300">{testimonial.name}</span>
      </div>
      <div className="text-sm text-wrap md:text-base md:font-medium text-neutral-300">{testimonial.content}</div>
    </div>
  );
}
