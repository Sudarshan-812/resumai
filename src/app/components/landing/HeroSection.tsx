'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, FileText, Upload } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] w-full flex flex-col items-center justify-center overflow-hidden bg-white pt-32 pb-20">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
      <div className="absolute bottom-[-20%] right-[20%] w-[600px] h-[600px] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply" />
      <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="z-10 text-center max-w-5xl px-4 relative">
        
        {/* Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-8 w-fit rounded-full border border-indigo-200 bg-indigo-50/50 backdrop-blur-sm px-4 py-2 shadow-sm"
        >
          <span className="flex items-center gap-2 text-sm font-bold text-indigo-700">
            <Sparkles className="h-4 w-4 fill-indigo-700" />
            Powered by Gemini 2.0 Flash
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-extrabold tracking-tighter text-gray-900 pb-6 leading-[1.1]"
        >
          Craft Your Perfect <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
             Resume with AI.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          Stop guessing keywords. We use Google's advanced AI to analyze your resume against job descriptions and boost your interview chances by 3x.
        </motion.p>
        
        {/* Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row gap-5 justify-center items-center"
        >
          {/* 👇 CHANGED: /signup -> /login */}
          <Link href="/login">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg px-10 py-8 rounded-full font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 transition-all">
              Build My Resume Free
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </Link>
          <div className="flex flex-col gap-1 items-start">
             <span className="text-xs font-semibold text-gray-500 ml-4">NO CREDIT CARD REQUIRED</span>
          </div>
        </motion.div>

        {/* Trust Strip */}
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="mt-16 pt-8 border-t border-gray-100"
        >
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">Trusted by engineers at</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {['Google', 'Microsoft', 'Amazon', 'Spotify', 'Netflix'].map((company) => (
                <span key={company} className="text-xl font-black text-gray-800">{company}</span>
             ))}
          </div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
          transition={{ y: { duration: 4, repeat: Infinity, ease: "easeInOut" }, delay: 0.6 }}
          className="absolute top-1/4 -left-24 hidden lg:flex items-center gap-2 bg-white p-3 rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] border border-indigo-50 -rotate-6 z-20"
        >
          <div className="bg-green-100 p-2 rounded-lg"><Upload className="w-5 h-5 text-green-600" /></div>
          <div className="text-left">
            <p className="text-xs text-gray-400 font-medium">Status</p>
            <p className="text-sm font-bold text-gray-800">Parsing PDF...</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0, y: [0, 15, 0] }}
          transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, delay: 0.7 }}
          className="absolute bottom-1/4 -right-24 hidden lg:flex items-center gap-2 bg-white p-3 rounded-2xl shadow-[0_20px_50px_rgba(124,_58,_237,_0.7)] border border-indigo-50 rotate-3 z-20"
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