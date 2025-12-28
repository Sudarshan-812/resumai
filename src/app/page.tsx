"use client";

import { useFreeTier } from "@/hooks/useFreeTier";
import Footer from "@/app/components/landing/Footer"; 
import Navbar from "@/app/components/landing/Navbar";
import HeroSection from '@/app/components/landing//HeroSection';
import FeatureGrid from '@/app/components/landing//FeatureGrid';
import HowItWorks from '@/app/components/landing//HowItWorks';
import Testimonials from '@/app/components/landing//Testimonials';

import CTASection from '@/app/components/CTASection';


export default function Home() {
  return (
    <main className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
    </main>
  );
}