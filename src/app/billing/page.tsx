"use client";

import Link from "next/link";
import { ArrowLeft, Check, Zap, Crown, Sparkles, Loader2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { useState } from "react";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment";
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Define our Plans Data
const PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 49,
    credits: 5,
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-zinc-200 dark:border-zinc-800",
    popular: false,
    features: ["5 AI Resume Scans", "Basic ATS Score", "Email Support"],
  },
  {
    id: "pro",
    name: "Pro Bundle",
    price: 99,
    credits: 12, // More value than before!
    icon: Sparkles,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    border: "border-indigo-500 dark:border-indigo-500",
    popular: true,
    features: ["12 AI Resume Scans", "Detailed Feedback", "Cover Letter Generator", "Priority Support"],
  },
  {
    id: "power",
    name: "Power User",
    price: 199,
    credits: 30,
    icon: Crown,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-zinc-200 dark:border-zinc-800",
    popular: false,
    features: ["30 AI Resume Scans", "Full Career Assistant", "Interview Prep AI", "Lifetime Access"],
  },
];

export default function BillingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (plan: typeof PLANS[0]) => {
    setLoadingId(plan.id);

    try {
      // 1. Create Order with Dynamic Price
      const result = await createRazorpayOrder(plan.price);
      if (!result.success || !result.orderId) throw new Error("Order creation failed");

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.price * 100,
        currency: "INR",
        name: `ResumAI ${plan.name}`,
        description: `${plan.credits} Credits`,
        order_id: result.orderId,
        
        handler: async function (response: any) {
          toast.loading("Verifying Payment...");
          
          // 3. Verify & Add Dynamic Credits
          const verification = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            plan.credits // 👈 Sending correct credits for the chosen plan
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-300">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Navbar */}
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Simple, Transparent Pricing</h1>
          <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
            Pay once, keep your credits forever. No monthly subscriptions or hidden fees.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          
          {PLANS.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "relative flex flex-col p-8 rounded-3xl border bg-white dark:bg-zinc-900/50 backdrop-blur-sm transition-all duration-300",
                plan.border,
                plan.popular ? "shadow-2xl shadow-indigo-500/20 scale-105 z-10" : "hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", plan.bg)}>
                  <plan.icon className={cn("w-6 h-6", plan.color)} />
                </div>
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">₹{plan.price}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-sm">/ one-time</span>
                </div>
              </div>

              {/* Credits Badge */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm font-medium">
                  <span className={plan.color}>{plan.credits} Credits</span>
                  <span className="text-zinc-400"> included</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                    <Check className={cn("w-4 h-4 shrink-0", plan.color)} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <button 
                onClick={() => handlePurchase(plan)}
                disabled={!!loadingId}
                className={cn(
                  "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                  plan.popular 
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                    : "bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200",
                  loadingId && loadingId !== plan.id && "opacity-50 cursor-not-allowed"
                )}
              >
                {loadingId === plan.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Buy Now"
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust Footer */}
        <div className="mt-16 text-center text-zinc-500 text-sm flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Secured by Razorpay. 100% Money-back guarantee.
        </div>
      </main>
    </div>
  );
}