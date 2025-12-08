'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/60 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          ResumAI
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#" className="hover:text-white transition-colors">Pricing</Link>
          <a href="https://github.com/Sudarshan-812/ai-resume" target="_blank" className="hover:text-white transition-colors">GitHub</a>
        </div>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
              Sign In
            </Button>
          </Link>
          <Link href="/login">
            <Button className="bg-white text-black hover:bg-gray-200 rounded-full font-semibold">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}