import Footer from "@/app/components/landing/Footer";
import Navbar from "@/app/components/landing/Navbar";
import HeroSection from '@/app/components/landing/HeroSection';
import FeatureGrid from '@/app/components/landing/FeatureGrid';
import HowItWorks from '@/app/components/landing/HowItWorks';
import Pricing from "./components/landing/Pricing";
import FAQ from "./components/landing/FAQ";

export default function Home() {
  return (
    <main className="min-h-screen bg-background selection:bg-blue-100 selection:text-blue-900">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}