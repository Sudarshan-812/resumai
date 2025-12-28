"use client";
import Link from "next/link";
import { Sparkles, Twitter, Linkedin, Instagram, Github } from "lucide-react";

export default function Footer() {
  return (
    /* 👇 CHANGED: border-gray-200 -> border-black */
    <footer className="border-t border-black bg-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white fill-white" />
              </div>
              ResumAI
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Helping Indian developers land top-tier tech jobs with AI-powered resume optimization.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Twitter className="w-5 h-5" /></Link>
              <Link href="#" className="text-gray-400 hover:text-blue-600 transition-colors"><Linkedin className="w-5 h-5" /></Link>
              <Link href="#" className="text-gray-400 hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5" /></Link>
              <Link href="#" className="text-gray-400 hover:text-gray-900 transition-colors"><Github className="w-5 h-5" /></Link>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6">Product</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="#features" className="hover:text-indigo-600 transition-colors">Features</Link></li>
              <li><Link href="#pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-indigo-600 transition-colors">Log In</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6">Legal</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-6">System Status</h3>
            <div className="flex items-center gap-2 text-sm text-emerald-600 mb-4 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              All Systems Operational
            </div>
            <p className="text-xs text-gray-400">
              Latest update: Gemini 1.5 Pro Model integrated.
            </p>
          </div>
        </div>

        {/* 👇 CHANGED: border-gray-100 -> border-black/10 (Subtle black divider) */}
        <div className="border-t border-black/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">© 2025 ResumAI Inc. Built in India 🇮🇳</p>
          <div className="flex gap-6 text-xs text-gray-500 font-medium">
             <span>v2.1.0</span>
             <span>Server: Mumbai (AWS)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}