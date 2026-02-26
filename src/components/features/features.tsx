import { Badge } from "@/components/ui/badge";
import { ScanFaceIcon, SparklesIcon, ShieldCheckIcon, LeafIcon } from "lucide-react";
import React from "react";

export interface FeatureSetting {
  title: string;
  description: string;
  image: string;
}

export interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
  gridArea?: string;
  bgClass?: string;
  background?: string;
}

export function Features({ settings = {} }: { settings?: { [key: string]: FeatureSetting } }) {
  const features: Feature[] = [
    {
      icon: <SparklesIcon className="w-8 h-8 md:w-12 md:h-12 text-foreground" />,
      title: settings["feature1"]?.title || "Signature Heavy Weave",
      description: settings["feature1"]?.description || "Crafted from premium heavyweight cotton, designed to hold its structure while delivering a smooth, refined finish. A clean, rich texture that elevates everyday streetwear.",
      gridArea: "md:col-span-2 md:row-span-2",
      bgClass: "bg-secondary/50",
      background: settings["feature1"]?.image,
    },
    {
      icon: <ShieldCheckIcon className="w-8 h-8 md:w-12 md:h-12 text-foreground" />,
      title: settings["feature2"]?.title || "Premium Surface Finish",
      description: settings["feature2"]?.description || "A refined, smooth surface that enhances the fabric's structure and drape. It offers a clean, sophisticated look while maintaining the garment's shape and integrity.",
      gridArea: "md:col-span-1 md:row-span-1",
      bgClass: "bg-secondary",
      background: settings["feature2"]?.image,
    },
    {
      icon: <ScanFaceIcon className="w-8 h-8 md:w-12 md:h-12 text-foreground" />,
      title: settings["feature3"]?.title || "Digital ID",
      description: settings["feature3"]?.description || "Every piece comes with an embedded NFC chip for authenticity.",
      gridArea: "md:col-span-1 md:row-span-1",
      bgClass: "bg-secondary",
      background: settings["feature3"]?.image,
    },
    {
      icon: <LeafIcon className="w-8 h-8 md:w-12 md:h-12 text-foreground" />,
      title: settings["feature4"]?.title || "Sustainable Core",
      description: settings["feature4"]?.description || "Crafted from 100% recycled polymers and organic mercerized cotton.",
      gridArea: "md:col-span-3 md:row-span-1",
      bgClass: "bg-secondary/50 border-t border-foreground/10",
      background: settings["feature4"]?.image,
    },
  ];

  return (
    <section id="features" className="w-full bg-background text-foreground px-6 py-24 md:px-12 md:py-32">
      <div className="max-w-7xl mx-auto flex flex-col gap-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-foreground/20 pb-12">
          <div className="flex flex-col gap-4 max-w-2xl">
            <Badge variant="outline" className="w-fit text-foreground border-foreground/30 uppercase tracking-widest text-xs px-4 py-1 rounded-full">
              Fabric Technology
            </Badge>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-foreground">
              BEYOND <br />
              <span className="text-muted-foreground/60">FABRIC.</span>
            </h2>
          </div>
          <p className="max-w-md text-lg text-muted-foreground font-medium leading-relaxed">
            We don&apos;t just make clothes. We engineer experiences using proprietary nanobana technology.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(250px,auto)]">
          {features.map((feature, i) => (
            <div key={i} className={`relative p-8 md:p-12 flex flex-col justify-between group overflow-hidden ${feature.gridArea} ${feature.bgClass} transition-colors hover:bg-secondary/80`}>
              {/* Background Image */}
              {feature.background && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={feature.background}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                </div>
              )}

              <div className={`relative z-10 mb-8 ${feature.background ? "text-white" : "text-foreground"}`}>
                {feature.icon}
              </div>

              <div className="relative z-10">
                <h3 className={`text-2xl md:text-4xl font-bold tracking-tight mb-4 group-hover:translate-x-2 transition-transform duration-300 ${feature.background ? "text-white drop-shadow-lg" : ""}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm md:text-base max-w-sm ${feature.background ? "text-white/80" : "text-muted-foreground"}`}>
                  {feature.description}
                </p>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
