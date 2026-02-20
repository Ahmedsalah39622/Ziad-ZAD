"use client";

import { useEffect, useRef, useState } from "react";

function useCountUp(end: number, duration: number = 2000, startCounting: boolean = false) {
  const [count, setCount] = useState(0);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!startCounting || hasRun.current) return;
    hasRun.current = true;

    const startTime = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    requestAnimationFrame(step);
  }, [startCounting, end, duration]);

  return count;
}

interface StatItem {
  value: number;
  suffix: string;
  label: string;
  duration?: number;
}

const stats: StatItem[] = [
  { value: 50, suffix: "K", label: "Waitlist Joined", duration: 2000 },
  { value: 1, suffix: "", label: "Genesis Edition", duration: 800 },
  { value: 100, suffix: "%", label: "Sustainable", duration: 2200 },
  { value: 10, suffix: "K+", label: "Happy Customers", duration: 1800 },
];

function StatCounter({ stat, inView }: { stat: StatItem; inView: boolean }) {
  const count = useCountUp(stat.value, stat.duration, inView);

  // Pad "001" style for Genesis Edition
  const displayValue = stat.label === "Genesis Edition"
    ? String(count).padStart(3, "0")
    : String(count);

  return (
    <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
      <span className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
        {displayValue}{stat.suffix}
      </span>
      <span className="text-sm font-bold uppercase tracking-widest text-neutral-500">
        {stat.label}
      </span>
    </div>
  );
}

export function Showcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#f5f5f5] text-black py-16 border-y border-neutral-200"
    >
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
        {stats.map((stat) => (
          <StatCounter key={stat.label} stat={stat} inView={inView} />
        ))}
      </div>
    </section>
  );
}
