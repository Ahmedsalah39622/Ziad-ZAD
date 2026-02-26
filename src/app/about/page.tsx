import type { Metadata } from "next";
import { Footer } from "@/components/footer/footer";
import { Nav } from "@/components/hero/nav";

export const metadata: Metadata = {
    title: "About Us — ZAD",
    description: "Learn more about ZAD, the next generation of Egyptian streetwear.",
};

export default function AboutPage() {
    return (
        <div className="flex h-full min-h-screen w-full flex-col justify-between bg-white text-black">
            <div className="flex w-full flex-col">
                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/5">
                    <Nav />
                </div>

                <main className="w-full">
                    {/* Hero Section */}
                    <section className="px-6 pt-24 pb-16 md:pt-32 md:pb-24 border-b border-black/5">
                        <div className="max-w-7xl mx-auto">
                            <p className="text-xs font-black tracking-[0.4em] uppercase text-neutral-400 mb-6">Our Story</p>
                            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85] mb-12">
                                The Next <br /> Generation.
                            </h1>
                            <div className="grid md:grid-cols-2 gap-12 items-end">
                                <p className="text-xl md:text-2xl font-medium leading-tight">
                                    ZAD isn't just a brand. It's a statement. Born in the heart of Egypt,
                                    we're redefining the intersection of traditional heritage and modern street culture.
                                </p>
                                <div className="flex gap-4">
                                    <div className="h-[2px] w-24 bg-black mt-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest text-neutral-500">Established 2026</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Mission & Vision */}
                    <section className="px-6 py-20 md:py-32 bg-black text-white">
                        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20">
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                                    Our Mission
                                </h2>
                                <p className="text-neutral-400 text-lg leading-relaxed">
                                    To empower the youth through bold designs that speak louder than words.
                                    We believe that what you wear is the most primitive form of communication.
                                    ZAD provides the vocabulary for that dialogue.
                                </p>
                            </div>
                            <div className="space-y-8">
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                                    Craftsmanship
                                </h2>
                                <p className="text-neutral-400 text-lg leading-relaxed">
                                    Every piece is engineered for the streets. We source the finest heavy-weight
                                    Egyptian cotton and combine it with cutting-edge silhouettes.
                                    Quality isn't an option — it's our foundation.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Core Values */}
                    <section className="px-6 py-20 md:py-32">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-xs font-black tracking-[0.4em] uppercase text-neutral-400 mb-16">Core Values</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                                <div>
                                    <span className="text-5xl font-black mb-6 block">01</span>
                                    <h3 className="text-xl font-bold uppercase mb-4">Authenticity</h3>
                                    <p className="text-neutral-500 leading-relaxed">
                                        No fillers. No fakes. Every drop is a limited expression of our creative vision.
                                    </p>
                                </div>
                                <div>
                                    <span className="text-5xl font-black mb-6 block">02</span>
                                    <h3 className="text-xl font-bold uppercase mb-4">Innovation</h3>
                                    <p className="text-neutral-500 leading-relaxed">
                                        Pushing the boundaries of what streetwear can be in the MENA region and beyond.
                                    </p>
                                </div>
                                <div>
                                    <span className="text-5xl font-black mb-6 block">03</span>
                                    <h3 className="text-xl font-bold uppercase mb-4">Community</h3>
                                    <p className="text-neutral-500 leading-relaxed">
                                        Building a movement of like-minded individuals who share our passion for excellence.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
            <Footer />
        </div>
    );
}
