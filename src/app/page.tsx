import { Access } from "@/components/landing/Access";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Markets } from "@/components/landing/Markets";
import { Parties } from "@/components/landing/Parties";
import { Problem } from "@/components/landing/Problem";
import { Waterfall } from "@/components/landing/Waterfall";

export default function Home() {
  return (
    <div id="top" className="flex min-h-full flex-col">
      <Header />
      <main id="main">
        <Hero />
        <Problem />
        <Parties />
        <HowItWorks />
        <Markets />
        <Waterfall />
        <Access />
      </main>
      <Footer />
    </div>
  );
}
