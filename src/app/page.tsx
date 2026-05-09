import Navbar from "@/app/components/landing/Navbar";
import HeroSection from "@/app/components/landing/HeroSection";
import FeatureGrid from "@/app/components/landing/FeatureGrid";
import HowItWorks from "@/app/components/landing/HowItWorks";
import VoiceHighlight from "@/app/components/landing/VoiceHighlight";
import Pricing from "@/app/components/landing/Pricing";
import FAQ from "@/app/components/landing/FAQ";
import Footer from "@/app/components/landing/Footer";

export default function Home() {
  return (
    <main style={{ background: "#F7F6F2", minHeight: "100vh" }}>
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <VoiceHighlight />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
