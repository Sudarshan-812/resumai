"use client";

import { Check, Loader2, ShieldCheck, Zap } from "lucide-react";
import DashboardShell from "@/app/dashboard/DashboardShell";
import { useState } from "react";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment";
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

declare global {
  interface Window { Razorpay: any; }
}

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    credits: 5,
    description: "Quick resume polish for a single application.",
    popular: false,
    features: [
      "5 AI resume scans",
      "ATS score + keyword gaps",
      "PDF export",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    credits: 12,
    description: "The right amount for an active job search.",
    popular: true,
    features: [
      "12 AI resume scans",
      "Detailed AI feedback",
      "Cover letter generator",
      "Interview simulator",
      "Priority support",
    ],
  },
  {
    id: "power",
    name: "Power",
    price: 199,
    credits: 30,
    description: "For serious candidates targeting multiple roles.",
    popular: false,
    features: [
      "30 AI resume scans",
      "Everything in Pro",
      "Voice AI interviews",
      "LinkedIn optimization",
      "Lifetime access",
    ],
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export default function BillingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (plan: typeof PLANS[number]) => {
    setLoadingId(plan.id);
    try {
      const result = await createRazorpayOrder(plan.price);
      if (!result.success || !result.orderId) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.price * 100,
        currency: "INR",
        name: `Column8 ${plan.name}`,
        description: `${plan.credits} Credits`,
        order_id: result.orderId,
        handler: async function (response: any) {
          toast.loading("Verifying payment…");
          const verification = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
          toast.dismiss();
          if (verification.success) {
            toast.success(`${verification.creditsAdded} credits added.`);
            router.push("/dashboard");
            router.refresh();
          } else {
            toast.error("Payment verification failed.");
          }
        },
        theme: { color: "#06b6d4" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      toast.error("Payment failed to start.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <DashboardShell>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-full" style={{ background: "#F7F6F2" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-10 md:py-14">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mb-12"
          >
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] mb-1.5" style={{ color: "#9B9890" }}>
              Credits & Billing
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: "#111111" }}>
              Pay once. Keep forever.
            </h1>
            <p className="text-sm mt-1.5" style={{ color: "#9B9890" }}>
              No subscriptions. No monthly fees. Credits never expire.
            </p>
          </motion.div>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan, i) => {
              const isDark = plan.popular;
              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.45, ease: EASE }}
                  className="relative flex flex-col rounded-2xl overflow-hidden"
                  style={{
                    background: isDark ? "#111111" : "#FFFFFF",
                    border: isDark ? "1px solid #1f1f1f" : "1px solid #E5E3DC",
                  }}
                >
                  {isDark && (
                    <div
                      className="absolute inset-0 pointer-events-none opacity-20"
                      style={{
                        backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                      }}
                    />
                  )}

                  {plan.popular && (
                    <div
                      className="relative px-5 py-2 text-[10px] font-mono uppercase tracking-[0.18em] font-semibold"
                      style={{ background: "#06b6d4", color: "#FFFFFF" }}
                    >
                      Most Popular
                    </div>
                  )}

                  <div className="relative flex flex-col flex-1 p-6">
                    <p className="text-[10px] font-mono uppercase tracking-[0.15em] mb-1" style={{ color: isDark ? "rgba(255,255,255,0.4)" : "#9B9890" }}>
                      {plan.name}
                    </p>
                    <p className="text-[13px] leading-relaxed mb-6" style={{ color: isDark ? "rgba(255,255,255,0.5)" : "#6B6860" }}>
                      {plan.description}
                    </p>

                    <div className="mb-1">
                      <span className="text-4xl font-bold tracking-tight tabular-nums" style={{ color: isDark ? "#FFFFFF" : "#111111" }}>
                        ₹{plan.price}
                      </span>
                      <span className="text-[12px] ml-1.5" style={{ color: isDark ? "rgba(255,255,255,0.3)" : "#C8C4BB" }}>
                        one-time
                      </span>
                    </div>

                    <div className="mb-6">
                      <span
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{
                          background: isDark ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.08)",
                          color: "#06b6d4",
                          border: "1px solid rgba(6,182,212,0.2)",
                        }}
                      >
                        <Zap size={10} />
                        {plan.credits} credits included
                      </span>
                    </div>

                    <div className="mb-5" style={{ height: "1px", background: isDark ? "rgba(255,255,255,0.08)" : "#E5E3DC" }} />

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: isDark ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.08)" }}
                          >
                            <Check size={9} style={{ color: "#06b6d4" }} strokeWidth={3} />
                          </div>
                          <span className="text-[13px] leading-snug" style={{ color: isDark ? "rgba(255,255,255,0.65)" : "#6B6860" }}>
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      onClick={() => handlePurchase(plan)}
                      disabled={!!loadingId}
                      whileHover={!loadingId ? { scale: 1.01 } : {}}
                      whileTap={!loadingId ? { scale: 0.98 } : {}}
                      className="w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      style={
                        isDark
                          ? { background: "#06b6d4", color: "#FFFFFF" }
                          : { background: "#111111", color: "#FFFFFF" }
                      }
                    >
                      {loadingId === plan.id ? (
                        <><Loader2 size={14} className="animate-spin" />Processing…</>
                      ) : (
                        "Get Started"
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="mt-14 pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12"
            style={{ borderTop: "1px solid #E5E3DC" }}
          >
            {[
              { icon: ShieldCheck, text: "Secure via Razorpay" },
              { icon: Zap,         text: "Instant activation"  },
              { icon: Check,       text: "Credits never expire" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon size={14} style={{ color: "#9B9890" }} />
                <span className="text-[12px]" style={{ color: "#9B9890" }}>{text}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </DashboardShell>
  );
}
