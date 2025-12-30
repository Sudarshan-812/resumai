"use client";

import Link from "next/link";
import { ArrowLeft, Check, Loader2, ShieldCheck, HelpCircle, Star } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { useState } from "react";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment";
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Improved Plan Data
const PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 49,
    credits: 5,
    // Silver Filter Applied here
    lottieSrc: "https://lottie.host/6d6286d6-3fc7-46aa-9697-ddd04346c8ac/tb1vgbgp3m.lottie",
    lottieClass: "grayscale brightness-110 contrast-125", 
    description: "Perfect for a quick resume polish.",
    color: "text-blue-500",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    buttonVariant: "outline",
    popular: false,
    features: ["5 AI Resume Scans", "Basic ATS Score", "Email Support", "PDF Export"],
  },
  {
    id: "pro",
    name: "Pro Bundle",
    price: 99,
    credits: 12,
    // Original Gold
    lottieSrc: "https://lottie.host/6d6286d6-3fc7-46aa-9697-ddd04346c8ac/tb1vgbgp3m.lottie",
    lottieClass: "", 
    description: "Our most popular choice for job seekers.",
    color: "text-indigo-500",
    badgeColor: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    buttonVariant: "solid",
    popular: true,
    features: ["12 AI Resume Scans", "Detailed Feedback", "Cover Letter Generator", "Priority Support", "LinkedIn Optimization"],
  },
  {
    id: "power",
    name: "Power User",
    price: 199,
    credits: 30,
    // Diamond Animation
    lottieSrc: "https://lottie.host/655b0575-535f-47ed-91e4-8ed938e2158d/eH0Et5paMQ.lottie",
    lottieClass: "scale-110", 
    description: "For serious career transformation.",
    color: "text-amber-500",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    buttonVariant: "outline",
    popular: false,
    features: ["30 AI Resume Scans", "Full Career Assistant", "Interview Prep AI", "Lifetime Access", "1-on-1 Strategy Call"],
  },
];

export default function BillingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (plan: typeof PLANS[0]) => {
    setLoadingId(plan.id);

    try {
      const result = await createRazorpayOrder(plan.price);
      if (!result.success || !result.orderId) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.price * 100,
        currency: "INR",
        name: `ResumAI ${plan.name}`,
        description: `${plan.credits} Credits`,
        order_id: result.orderId,
        handler: async function (response: any) {
          toast.loading("Verifying Payment...");
          const verification = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            plan.credits
          );

          if (verification.success) {
            toast.dismiss();
            toast.success(`Success! ${plan.credits} Credits Added.`);
            router.push("/dashboard");
            router.refresh();
          } else {
            toast.dismiss();
            toast.error("Verification Failed");
          }
        },
        theme: { color: "#4F46E5" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      toast.error("Payment failed to start");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-300 selection:bg-indigo-500/30 pb-20">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Background Decor */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-[#09090b] [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)] opacity-20 pointer-events-none" />

      {/* Navbar */}
      <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/dashboard" 
            className="group flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
          >
            <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-400 dark:from-white dark:via-zinc-200 dark:to-zinc-600 bg-clip-text text-transparent">
            Invest in your Career
          </h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Pay once, keep your credits forever. No monthly subscriptions, no hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative items-stretch">
          
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "group relative flex flex-col p-8 rounded-3xl transition-all duration-300",
                "bg-white dark:bg-zinc-900/40 backdrop-blur-xl border",
                plan.popular 
                  ? "border-indigo-500 dark:border-indigo-500/50 shadow-2xl shadow-indigo-500/10 z-10 scale-100 md:scale-105" 
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-indigo-500/30 flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-white" />
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                
                {/* Animation - Centered via mx-auto */}
                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                   <DotLottieReact
                      src={plan.lottieSrc}
                      loop
                      autoplay
                      className={cn("w-full h-full", plan.lottieClass)}
                   />
                </div>

                {/* Name - Added 'text-center' */}
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
                  {plan.name}
                </h3>

                {/* Description - Added 'text-center' */}
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 min-h-[40px] text-center">
                  {plan.description}
                </p>
                
                {/* Price - Added 'justify-center' */}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold tracking-tight">₹{plan.price}</span>
                  <span className="text-zinc-400 text-sm font-medium">/ one-time</span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 mb-6" />

              {/* Features */}
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3">
                  <div className={cn("px-2.5 py-1 rounded-md text-sm font-bold", plan.badgeColor)}>
                    {plan.credits} Credits Included
                  </div>
                </li>
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <Check className={cn("w-5 h-5 shrink-0 mt-0.5", plan.color)} />
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button 
                onClick={() => handlePurchase(plan)}
                disabled={!!loadingId}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-auto",
                  loadingId && loadingId !== plan.id && "opacity-50 cursor-not-allowed",
                  plan.popular 
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5" 
                    : "bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700"
                )}
              >
                {loadingId === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Get Started"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Footer Trust Section */}
        <div className="mt-20 pt-10 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <div className="inline-flex flex-col md:flex-row items-center gap-4 md:gap-12 text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Secure Payment via Razorpay
            </span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-500" />
              Instant Credit Activation
            </span>
            <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-indigo-500" />
              24/7 Priority Support
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}