"use client";

import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";

export default function BillingPage() {
  
  const handlePurchase = () => {
    console.log("Processing Payment...");
    // Razorpay logic goes here later
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-300">
      
      {/* Navbar */}
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
             <span className="text-sm text-zinc-400">Secure Checkout</span>
             <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h1>
          <p className="text-zinc-500">Pay once, use forever. No hidden subscription fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* FREE CARD (Simple Gray) */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col">
            <div className="mb-4">
              <span className="bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Free Tier
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Guest User</h2>
            <div className="text-4xl font-bold mb-6">₹0</div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500" />
                1 Free Scan
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Check className="w-4 h-4 text-green-500" />
                Basic ATS Score
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400 line-through">
                Detailed Feedback
              </li>
            </ul>

            <button disabled className="w-full py-3 bg-gray-100 dark:bg-zinc-800 text-gray-400 font-bold rounded-lg cursor-not-allowed">
              Current Plan
            </button>
          </div>

          {/* PRO CARD (Razorpay Blue) */}
          <div className="bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-xl p-8 flex flex-col relative shadow-xl shadow-blue-900/5">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg">
              RECOMMENDED
            </div>
            
            <div className="mb-4">
              <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Pro Bundle
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">10 Credits Pack</h2>
            <div className="flex items-end gap-2 mb-6">
               <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">₹99</div>
               <div className="text-gray-400 text-sm mb-1 line-through">₹499</div>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-sm font-medium">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-0.5 rounded-full"><Check className="w-3 h-3 text-blue-600 dark:text-blue-400" /></div>
                10 Full AI Resumes Scans
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-0.5 rounded-full"><Check className="w-3 h-3 text-blue-600 dark:text-blue-400" /></div>
                Unlock Cover Letter Generator
              </li>
              <li className="flex items-center gap-3 text-sm font-medium">
                <div className="bg-blue-100 dark:bg-blue-900/50 p-0.5 rounded-full"><Check className="w-3 h-3 text-blue-600 dark:text-blue-400" /></div>
                Unlock Interview Prep Questions
              </li>
            </ul>

            <button 
              onClick={handlePurchase}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-600/20"
            >
              Buy Now
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-3 h-3" />
              Secured by Razorpay
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}