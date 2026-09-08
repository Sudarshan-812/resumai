import Navbar from "@/app/components/landing/Navbar";
import HeroSection from "@/app/components/landing/HeroSection";
import VoiceHighlight from "@/app/components/landing/VoiceHighlight";
import FeatureGrid from "@/app/components/landing/FeatureGrid";
import HowItWorks from "@/app/components/landing/HowItWorks";
import Pricing from "@/app/components/landing/Pricing";
import FAQ from "@/app/components/landing/FAQ";
import Footer from "@/app/components/landing/Footer";

export default function Home() {
  return (
    <main style={{ background: "#f9f9fb", minHeight: "100vh" }}>
      <Navbar />
      <HeroSection />
      <VoiceHighlight />
      <FeatureGrid />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
