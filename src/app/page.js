import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 -mt-20">
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
