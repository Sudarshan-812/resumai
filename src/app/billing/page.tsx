"use client";

import { Check, Loader2, ShieldCheck, Zap, Star, ArrowRight } from "lucide-react";
import DashboardShell from "@/app/dashboard/DashboardShell";
import { useState } from "react";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment";
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

declare global { interface Window { Razorpay: any } }

const SPRING = { type: "spring", stiffness: 280, damping: 26 } as const;
const EASE   = [0.16, 1, 0.3, 1] as const;

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    credits: 5,
    description: "Quick resume polish for a single application.",
    popular: false,
    accentColor: "#9B9890",
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
    accentColor: "#06b6d4",
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
    accentColor: "#7c3aed",
    features: [
      "30 AI resume scans",
      "Everything in Pro",
      "Voice AI interviews",
      "LinkedIn optimization",
      "Lifetime access",
    ],
  },
] as const;

export default function BillingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (plan: typeof PLANS[number]) => {
    setLoadingId(plan.id);
    try {
      const result = await createRazorpayOrder(plan.price);
      if (!result.success || !result.orderId) throw new Error("Order creation failed");

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.price * 100,
        currency: "INR",
        name: `Column8 ${plan.name}`,
        description: `${plan.credits} Credits`,
        order_id: result.orderId,
        handler: async (response: any) => {
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
      });
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

      <div style={{ background: "#F7F6F2", minHeight: "100%" }}>

        {/* ── White header ── */}
        <div style={{ background: "#FFFFFF", borderBottom: "1px solid #E5E3DC" }}>
          <div className="max-w-4xl mx-auto px-6 md:px-10 pt-10 pb-8">
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <p className="text-[9px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: "#9B9890" }}>
                Credits & Billing
              </p>
              <h1 className="font-display font-semibold tracking-tight mb-2"
                style={{ color: "#111111", fontSize: "clamp(26px, 5vw, 40px)", lineHeight: 1.15 }}>
                Pay once. Keep forever.
              </h1>
              <p className="text-[14px]" style={{ color: "#6B6860" }}>
                No subscriptions. No monthly fees. Credits never expire.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── Plans ── */}
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:gap-px"
            style={{ background: "#E5E3DC", borderRadius: 0 }}>
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 240, damping: 26 }}
                className="relative flex flex-col"
                style={{ background: plan.popular ? "#FFFFFF" : "#F7F6F2" }}
              >
                {/* Accent top stripe */}
                <motion.div
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: EASE }}
                  style={{ height: 3, background: plan.accentColor, transformOrigin: "left" }}
                />

                <div className="flex flex-col flex-1 p-7">

                  {/* Plan name + popular badge */}
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[9px] font-mono uppercase tracking-[0.2em] font-bold"
                      style={{ color: plan.accentColor }}>
                      {plan.name}
                    </p>
                    {plan.popular && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 400, damping: 20 }}
                        className="inline-flex items-center gap-1 text-[8px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full"
                        style={{ background: `${plan.accentColor}15`, color: plan.accentColor, border: `1px solid ${plan.accentColor}30` }}>
                        <Star size={7} fill="currentColor" /> Popular
                      </motion.span>
                    )}
                  </div>

                  <p className="text-[12px] leading-relaxed mb-6" style={{ color: "#9B9890" }}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="font-black tabular-nums"
                      style={{ fontSize: 44, color: "#111111", letterSpacing: "-0.04em", lineHeight: 1 }}>
                      ₹{plan.price}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono mb-6" style={{ color: "#C8C4BB" }}>
                    one-time · {plan.credits} credits
                  </p>

                  <div style={{ height: 1, background: "#E5E3DC", marginBottom: 20 }} />

                  {/* Features */}
                  <ul className="space-y-3 flex-1 mb-8">
                    {plan.features.map((f, fi) => (
                      <motion.li key={fi}
                        initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.07 + fi * 0.04, type: "spring", stiffness: 280, damping: 26 }}
                        className="flex items-start gap-2.5 text-[12.5px]"
                        style={{ color: "#6B6860" }}>
                        <Check size={11} strokeWidth={3} className="shrink-0 mt-0.5"
                          style={{ color: plan.accentColor }} />
                        {f}
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    onClick={() => handlePurchase(plan)}
                    disabled={!!loadingId}
                    whileHover={!loadingId ? { y: -2, boxShadow: `0 14px 32px ${plan.accentColor}30` } : {}}
                    whileTap={!loadingId ? { scale: 0.97 } : {}}
                    transition={SPRING}
                    className="group w-full h-11 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                    style={plan.popular
                      ? { background: `linear-gradient(135deg, ${plan.accentColor}, #0891b2)`, color: "#FFFFFF", boxShadow: `0 4px 18px ${plan.accentColor}25` }
                      : { background: "transparent", color: plan.accentColor, border: `1.5px solid ${plan.accentColor}40` }
                    }
                  >
                    <AnimatePresence mode="wait">
                      {loadingId === plan.id ? (
                        <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2">
                          <Loader2 size={13} className="animate-spin" /> Processing…
                        </motion.span>
                      ) : (
                        <motion.span key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="flex items-center gap-2">
                          Get {plan.name}
                          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>

                </div>
              </motion.div>
            ))}
          </div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 py-6"
            style={{ borderTop: "1px solid #E5E3DC" }}
          >
            {[
              { icon: ShieldCheck, text: "Secure via Razorpay" },
              { icon: Zap,         text: "Instant activation"  },
              { icon: Check,       text: "Credits never expire" },
            ].map(({ icon: Icon, text }, i) => (
              <motion.div key={text}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.07 }}
                className="flex items-center gap-2">
                <Icon size={13} style={{ color: "#C8C4BB" }} />
                <span className="text-[11px] font-medium" style={{ color: "#9B9890" }}>{text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </DashboardShell>
  );
}
