"use client";
import Link from "next/link";
import { Sparkles, Twitter, Linkedin, Instagram, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-black fill-black" />
              </div>
              ResumAI
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Helping Indian developers land top-tier tech jobs with AI-powered resume optimization.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="https://twitter.com" target="_blank" className="text-zinc-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></Link>
              <Link href="https://linkedin.com" target="_blank" className="text-zinc-400 hover:text-blue-500 transition-colors"><Linkedin className="w-5 h-5" /></Link>
              <Link href="https://instagram.com" target="_blank" className="text-zinc-400 hover:text-pink-500 transition-colors"><Instagram className="w-5 h-5" /></Link>
              <Link href="https://github.com" target="_blank" className="text-zinc-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-bold text-white mb-6">Product</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/#features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Resume Score</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Log In</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-bold text-white mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-conditions" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/shipping-delivery" className="hover:text-white transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact-us" className="hover:text-white transition-colors">Contact Support</Link></li>
            </ul>
          </div>

          {/* Newsletter / Status */}
          <div>
            <h3 className="font-bold text-white mb-6">System Status</h3>
            <div className="flex items-center gap-2 text-sm text-emerald-400 mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </div>
            <p className="text-xs text-zinc-500">
              Latest update: Gemini 1.5 Pro Model integrated for higher accuracy.
            </p>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-sm">© 2025 ResumAI Inc. Built in India 🇮🇳</p>
          <div className="flex gap-6 text-xs text-zinc-600 font-medium">
             <span>v2.1.0</span>
             <span>Server: Mumbai (AWS)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}