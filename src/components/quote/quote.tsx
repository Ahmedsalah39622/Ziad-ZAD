import { QuoteIcon } from "lucide-react";

export function Quote() {
  return (
    <section className="w-full bg-black text-white py-24 md:py-32 px-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full opacity-25 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black whitespace-nowrap text-neutral-700 select-none">
          ZAD
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
        <QuoteIcon className="w-12 h-12 text-neutral-500 mb-4" />

        <blockquote className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase">
          "We don't just designs clothes. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-white">
            We engineer movement.
          </span>"
        </blockquote>

        <div className="w-24 h-1 bg-white/20 mt-4"></div>

        <cite className="not-italic flex flex-col items-center gap-2 mt-4">
          <span className="text-xl font-bold tracking-widest uppercase">The ZAD Philosophy</span>
          <span className="text-neutral-500 text-sm font-medium tracking-wider">EST. 2026 // GENESIS EDITION</span>
        </cite>
      </div>
    </section>
  );
}
