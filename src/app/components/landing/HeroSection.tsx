'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-white pt-16">
      
      {/* Background Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      
      {/* Soft Gradients */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-100/50 rounded-full blur-[100px]" />

      {/* Main Content */}
      <div className="z-10 text-center max-w-4xl px-4 relative">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 w-fit rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-indigo-700">
            <Sparkles className="h-4 w-4" />
            Powered by Gemini 2.0 Flash
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 pb-2 leading-tight"
        >
          Craft Your Perfect <br />
          <span className="text-indigo-600">Resume with AI</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
        >
          Stop struggling with generic templates. Upload your existing resume and let our AI optimize it for ATS scores, write cover letters, and prep you for interviews.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 text-white hover:bg-indigo-700 text-lg px-8 py-6 rounded-full font-semibold transition-all hover:shadow-xl hover:shadow-indigo-200 hover:-translate-y-1">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#how-it-works">
            {/* 👇 CHANGED: border-gray-200 -> border-black */}
            <Button size="lg" variant="outline" className="border-black bg-white text-gray-700 hover:bg-gray-50 text-lg px-8 py-6 rounded-full shadow-sm">
              How it works
            </Button>
          </Link>
        </motion.div>
      </div>
      
      {/* Fade at bottom */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-white to-transparent z-20" />
    </section>
  );
}