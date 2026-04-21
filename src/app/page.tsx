import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";

export default function Home() {
  return (
    <main className="min-h-screen bg-surface-secondary dark:bg-slate-950">
      <Navbar />
      <HeroSection />
    </main>
  );
}
