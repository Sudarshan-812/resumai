"use client";

import { useFreeTier } from "@/hooks/useFreeTier";
import Footer from "@/app/components/landing/Footer"; 
import Navbar from "@/app/components/landing/Navbar";
import HeroSection from '@/app/components/landing//HeroSection';
import FeatureGrid from '@/app/components/landing//FeatureGrid';
import HowItWorks from '@/app/components/landing//HowItWorks';
import Testimonials from '@/app/components/landing//Testimonials';


export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Assuming components are in app/components/ 
         Adjust paths if you keep them in a different folder structure (e.g. @/components)
      */}
      
      <Navbar />
      
      <HeroSection />
      
      <FeatureGrid />
      
      <HowItWorks />
      
      <Testimonials />
      
      <Footer />
      
    </main>
  );
}