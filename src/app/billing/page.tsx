"use client";

import Link from "next/link";
import { Check, Loader2, ShieldCheck, HelpCircle, Star } from "lucide-react";
import DashboardShell from "@/app/dashboard/DashboardShell";
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

const PLANS = [
  {
    id: "starter",
    name: "Starter Pack",
    price: 49,
    credits: 5,
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
    lottieSrc: "https://lottie.host/6d6286d6-3fc7-46aa-9697-ddd04346c8ac/tb1vgbgp3m.lottie",
    lottieClass: "",
    description: "Our most popular choice for job seekers.",
    color: "text-blue-500",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    buttonVariant: "solid",
    popular: true,
    features: ["12 AI Resume Scans", "Detailed Feedback", "Cover Letter Generator", "Priority Support", "LinkedIn Optimization"],
  },
  {
    id: "power",
    name: "Power User",
    price: 199,
    credits: 30,
    lottieSrc: "https://lottie.host/655b0575-535f-47ed-91e4-8ed938e2158d/eH0Et5paMQ.lottie",
    lottieClass: "scale-110",
    description: "For serious career transformation.",
    color: "text-amber-500",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    buttonVariant: "outline",
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
          );

          if (verification.success) {
            toast.dismiss();
            toast.success(`Success! ${verification.creditsAdded} Credits Added.`);
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
    <DashboardShell>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1.5">Credits &amp; Billing</h1>
          <p className="text-sm text-muted-foreground">
            Pay once, keep your credits forever. No subscriptions, no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative items-start">

          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "group relative flex flex-col p-8 rounded-3xl transition-all duration-300",
                "bg-white dark:bg-zinc-900/40 backdrop-blur-xl border",
                plan.popular
                  ? "border-blue-500 dark:border-blue-500/50 shadow-2xl shadow-blue-500/10 z-10"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-fit bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-blue-500/30 flex items-center gap-1.5">
                  <Star className="w-3 h-3 fill-white" />
                  Most Popular
                </div>
              )}

              <div className="mb-6">

                <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                   <DotLottieReact
                      src={plan.lottieSrc}
                      loop
                      autoplay
                      className={cn("w-full h-full", plan.lottieClass)}
                   />
                </div>

                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2 text-center">
                  {plan.name}
                </h3>

                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 min-h-[40px] text-center">
                  {plan.description}
                </p>

                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold tracking-tight">₹{plan.price}</span>
                  <span className="text-zinc-400 text-sm font-medium">/ one-time</span>
                </div>
              </div>

              <div className="h-px w-full bg-zinc-100 dark:bg-zinc-800 mb-6" />

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

              <button
                onClick={() => handlePurchase(plan)}
                disabled={!!loadingId}
                className={cn(
                  "w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 mt-auto",
                  loadingId && loadingId !== plan.id && "opacity-50 cursor-not-allowed",
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
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
              <HelpCircle className="w-5 h-5 text-blue-500" />
              24/7 Priority Support
            </span>
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
