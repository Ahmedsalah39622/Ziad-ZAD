import { Badge } from "@/components/ui/badge";
import { ScanFaceIcon, SparklesIcon, ShieldCheckIcon, LeafIcon } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: <SparklesIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />,
      title: "Signature Heavy Weave",
      description: "Crafted from premium heavyweight cotton, designed to hold its structure while delivering a smooth, refined finish. A clean, rich texture that elevates everyday streetwear.",
      gridArea: "md:col-span-2 md:row-span-2",
      bgClass: "bg-neutral-900",
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />,
      title: "Premium Surface Finish",
      description: "A refined, smooth surface that enhances the fabric's structure and drape. It offers a clean, sophisticated look while maintaining the garment's shape and integrity.",
      gridArea: "md:col-span-1 md:row-span-1",
      bgClass: "bg-neutral-800",
    },
    {
      icon: <ScanFaceIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />,
      title: "Digital ID",
      description: "Every piece comes with an embedded NFC chip for authenticity.",
      gridArea: "md:col-span-1 md:row-span-1",
      bgClass: "bg-neutral-800",
    },
    {
      icon: <LeafIcon className="w-8 h-8 md:w-12 md:h-12 text-white" />,
      title: "Sustainable Core",
      description: "Crafted from 100% recycled polymers and organic mercerized cotton.",
      gridArea: "md:col-span-3 md:row-span-1",
      bgClass: "bg-neutral-900 border-t border-white/10",
    },
  ];

  return (
    <section id="features" className="w-full bg-black text-white px-6 py-24 md:px-12 md:py-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-white/20 pb-12">
          <div className="flex flex-col gap-4 max-w-2xl">
            <Badge variant="outline" className="w-fit text-white border-white/30 uppercase tracking-widest text-xs px-4 py-1 rounded-full">
              Fabric Technology
            </Badge>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white">
              BEYOND <br />
              <span className="text-neutral-500">FABRIC.</span>
            </h2>
          </div>
          <p className="max-w-md text-lg text-neutral-400 font-medium leading-relaxed">
            We don't just make clothes. We engineer experiences using proprietary nanobana technology.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(250px,auto)]">
          {features.map((feature, i) => (
            <div key={i} className={`relative p-8 md:p-12 flex flex-col justify-between group overflow-hidden ${feature.gridArea} ${feature.bgClass} transition-colors hover:bg-neutral-800`}>
              <div className="mb-8">{feature.icon}</div>

              <div className="relative z-10">
                <h3 className="text-2xl md:text-4xl font-bold tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-300">
                  {feature.title}
                </h3>
                <p className="text-neutral-400 text-sm md:text-base max-w-sm">
                  {feature.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
