'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black text-white">
      
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black" />
      <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-20" />

      {/* Main Content */}
      <div className="z-10 text-center max-w-4xl px-4">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-6 w-fit rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5"
        >
          <span className="flex items-center gap-2 text-sm font-medium text-indigo-300">
            <Sparkles className="h-4 w-4" />
            Powered by Gemini 2.0 Flash
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
        >
          Craft Your Perfect <br />
          <span className="text-indigo-500">Resume with AI</span>
        </motion.h1>

        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto"
        >
          Stop struggling with generic templates. Upload your existing resume and let our AI optimize it for ATS scores, write cover letters, and prep you for interviews.
        </motion.p>

        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/login">
            <Button size="lg" className="bg-white text-black hover:bg-purple-500 text-lg px-8 py-6 rounded-full font-semibold">
              Get Started for Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features">
            <Button size="lg" variant="outline" className="border-gray-800 text-black hover:bg-purple-500 text-lg px-8 py-6 rounded-full">
              How it works
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Grid Effect at bottom */}
      <div className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-black to-transparent z-20" />
    </section>
  );
}