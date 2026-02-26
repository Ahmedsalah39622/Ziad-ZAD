import { Footer } from "@/components/footer/footer";
import { Nav } from "@/components/hero/nav";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-screen w-full flex-col justify-between bg-[#0a0a0a] text-white">
      <div className="flex w-full flex-col">
        <div className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-xl">
          <Nav />
        </div>
        {children}
      </div>
      <Footer />
    </div>
  );
}
