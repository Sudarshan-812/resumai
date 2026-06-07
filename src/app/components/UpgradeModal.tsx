"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mic, Zap, Check, Loader2 } from "lucide-react";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment";
import { toast } from "sonner";
import Script from "next/script";

declare global { interface Window { Razorpay: any } }

interface Props {
  open: boolean;
  reason: "voice" | "limit";
  onClose: () => void;
  onSuccess: () => void;
}

const SPRING = { type: "spring", stiffness: 360, damping: 28 } as const;

const PLANS = [
  {
    id: "pro",
    name: "Pro",
    price: 99,
    credits: 12,
    popular: true,
    features: ["Unlimited interviews / month", "Voice AI interview mode", "12 resume scan credits", "Priority support"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 199,
    credits: 30,
    popular: false,
    features: ["Everything in Pro", "30 resume scan credits", "LinkedIn optimization", "Lifetime access"],
  },
] as const;

export default function UpgradeModal({ open, reason, onClose, onSuccess }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

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
        description: `${plan.credits} Credits + Unlimited Interviews`,
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
            toast.success("Plan upgraded! You're all set.");
            onClose();
            onSuccess();
          } else {
            toast.error("Verification failed — contact support with your payment ID.");
          }
        },
        theme: { color: "#06b6d4" },
      });
      rzp.open();
    } catch {
      toast.error("Could not start payment. Try again.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: "rgba(17,17,17,0.35)", backdropFilter: "blur(4px)" }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={SPRING}
              className="relative w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", boxShadow: "0 32px 80px rgba(0,0,0,0.12)" }}
            >
              {/* Cyan accent stripe */}
              <div style={{ height: 3, background: "linear-gradient(90deg,#06b6d4,#0891b2)" }} />

              {/* Close */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={SPRING}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#F7F6F2", color: "#9B9890" }}
              >
                <X size={14} />
              </motion.button>

              <div className="p-6 pt-5">
                {/* Icon + heading */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.18)" }}
                >
                  {reason === "voice"
                    ? <Mic size={18} style={{ color: "#06b6d4" }} />
                    : <Zap size={18} style={{ color: "#06b6d4" }} />
                  }
                </div>

                <h2 className="font-display text-xl font-semibold mb-1.5" style={{ color: "#111111" }}>
                  {reason === "voice" ? "Unlock Voice Interviews" : "Interview Limit Reached"}
                </h2>
                <p className="text-[13px] leading-relaxed mb-6" style={{ color: "#6B6860" }}>
                  {reason === "voice"
                    ? "Voice AI interviewer is available on Pro and Premium plans."
                    : "You've used all 3 free interviews this month. Upgrade to practice without limits."
                  }
                </p>

                {/* Plans */}
                <div className="space-y-3">
                  {PLANS.map((plan, pi) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: pi * 0.07, type: "spring", stiffness: 280, damping: 26 }}
                      className="rounded-xl p-4 relative"
                      style={plan.popular
                        ? { background: "#F0FDFE", border: "2px solid #06b6d4" }
                        : { background: "#F7F6F2", border: "1px solid #E5E3DC" }
                      }
                    >
                      {/* Popular badge */}
                      {plan.popular && (
                        <span className="absolute -top-2.5 left-4 text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full"
                          style={{ background: "#06b6d4", color: "#FFFFFF" }}>
                          Recommended
                        </span>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[14px] font-bold" style={{ color: "#111111" }}>{plan.name}</span>
                        <div className="text-right">
                          <span className="text-[20px] font-black tabular-nums" style={{ color: "#111111", letterSpacing: "-0.03em" }}>
                            ₹{plan.price}
                          </span>
                          <span className="text-[10px] ml-1" style={{ color: "#9B9890" }}>one-time</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[12px]" style={{ color: "#6B6860" }}>
                            <Check size={10} style={{ color: "#06b6d4", marginTop: 2 }} strokeWidth={3} className="shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <motion.button
                        onClick={() => handlePurchase(plan)}
                        disabled={!!loadingId}
                        whileHover={!loadingId ? { y: -1, boxShadow: "0 10px 24px rgba(6,182,212,0.28)" } : {}}
                        whileTap={!loadingId ? { scale: 0.98 } : {}}
                        transition={SPRING}
                        className="w-full h-9 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "#FFFFFF", boxShadow: "0 4px 14px rgba(6,182,212,0.2)" }}
                      >
                        {loadingId === plan.id
                          ? <><Loader2 size={12} className="animate-spin" />Processing…</>
                          : `Upgrade to ${plan.name} — ₹${plan.price}`
                        }
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                <p className="text-center text-[11px] mt-4" style={{ color: "#C8C4BB" }}>
                  One-time · Credits never expire · Secure via Razorpay
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
