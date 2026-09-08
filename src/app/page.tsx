import { createClient } from "@/app/lib/supabase/server";
import Navbar from "@/app/components/landing/Navbar";
import HeroSection from "@/app/components/landing/HeroSection";
import VoiceHighlight from "@/app/components/landing/VoiceHighlight";
import FeatureGrid from "@/app/components/landing/FeatureGrid";
import HowItWorks from "@/app/components/landing/HowItWorks";
import Pricing from "@/app/components/landing/Pricing";
import FAQ from "@/app/components/landing/FAQ";
import Footer from "@/app/components/landing/Footer";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const initialUser = user
    ? {
        name:
          user.user_metadata?.full_name?.split(" ")[0] ||
          user.email?.split("@")[0] ||
          "User",
        initial: (
          user.user_metadata?.full_name?.[0] ||
          user.email?.[0] ||
          "U"
        ).toUpperCase(),
        avatarUrl: user.user_metadata?.avatar_url as string | undefined,
      }
    : null;

  return (
    <main style={{ background: "#f9f9fb", minHeight: "100vh" }}>
      <Navbar initialUser={initialUser} />
      <HeroSection initialLoggedIn={!!user} />
      <VoiceHighlight />
      <FeatureGrid />
      <HowItWorks />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
