'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, FileText, Upload } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#fafafa] pt-24 pb-12">
      
      {/* --- Ambient Background Glows --- */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply" />
      
      {/* Dot Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Content Container */}
      <div className="z-10 text-center max-w-5xl px-4 relative">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-8 w-fit rounded-full border border-indigo-200 bg-white/50 backdrop-blur-md px-4 py-1.5 shadow-sm"
        >
          <span className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles className="h-4 w-4 fill-indigo-600" />
            Now powered by Gemini 2.0 Flash
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 pb-4 leading-[1.1]"
        >
          Your Resume, but <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
             Irresistible to AI.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          Don't let ATS bots reject your dream job. Optimize your resume and generate cover letters in seconds with our advanced AI engine.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/signup">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-8 py-7 rounded-full font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all">
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="#demo">
            <Button size="lg" variant="outline" className="border-indigo-200 text-indigo-700 bg-white hover:bg-indigo-50 text-lg px-8 py-7 rounded-full font-semibold">
              View Sample Resume
            </Button>
          </Link>
        </motion.div>

        {/* --- Floating Visual Elements (Decorations) --- */}
        
        {/* Top Left Element - Moved further out and up */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          /* 👇 CHANGED positions: top-20 left-0 -> top-1/4 -left-24 */
          className="absolute top-1/4 -left-24 hidden lg:flex items-center gap-2 bg-white p-3 rounded-2xl shadow-lg border border-indigo-50 -rotate-6"
        >
          <div className="bg-green-100 p-2 rounded-lg"><Upload className="w-5 h-5 text-green-600" /></div>
          <div className="text-left">
            <p className="text-xs text-gray-400 font-medium">Status</p>
            <p className="text-sm font-bold text-gray-800">Parsing PDF...</p>
          </div>
        </motion.div>

        {/* Bottom Right Element - Moved further out and down */}
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          /* 👇 CHANGED positions: bottom-20 right-0 -> bottom-1/4 -right-24 */
          className="absolute bottom-1/4 -right-24 hidden lg:flex items-center gap-2 bg-white p-3 rounded-2xl shadow-lg border border-indigo-50 rotate-3"
        >
           <div className="bg-purple-100 p-2 rounded-lg"><FileText className="w-5 h-5 text-purple-600" /></div>
          <div className="text-left">
            <p className="text-xs text-gray-400 font-medium">ATS Score</p>
            <p className="text-sm font-bold text-gray-800">92/100 Excellent</p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}