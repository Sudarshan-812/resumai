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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0"
              style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }}
              onClick={onClose}
            />

            {/* Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden"
              style={{ background: "#FFFFFF", border: "1px solid #E5E3DC", boxShadow: "0 24px 64px rgba(0,0,0,0.16)" }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "#F7F6F2", color: "#9B9890" }}
              >
                <X size={14} />
              </button>

              <div className="p-6">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.18)" }}
                >
                  {reason === "voice"
                    ? <Mic size={18} style={{ color: "#06b6d4" }} />
                    : <Zap size={18} style={{ color: "#06b6d4" }} />
                  }
                </div>

                <h2 className="font-display text-xl font-semibold mb-1" style={{ color: "#111111" }}>
                  {reason === "voice" ? "Unlock Voice Interviews" : "Interview Limit Reached"}
                </h2>
                <p className="text-sm mb-6" style={{ color: "#9B9890" }}>
                  {reason === "voice"
                    ? "Voice AI interviewer is available on Pro and Premium plans."
                    : "You've used all 3 free interviews this month. Upgrade to practice without limits."}
                </p>

                {/* Plans */}
                <div className="space-y-3">
                  {PLANS.map((plan) => (
                    <div
                      key={plan.id}
                      className="rounded-xl p-4"
                      style={plan.popular
                        ? { background: "#111111", border: "1px solid #1f1f1f" }
                        : { background: "#F7F6F2", border: "1px solid #E5E3DC" }
                      }
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: plan.popular ? "#FFFFFF" : "#111111" }}>
                            {plan.name}
                          </span>
                          {plan.popular && (
                            <span className="text-[9px] font-bold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full" style={{ background: "#06b6d4", color: "#FFFFFF" }}>
                              Recommended
                            </span>
                          )}
                        </div>
                        <span className="text-lg font-bold tabular-nums" style={{ color: plan.popular ? "#FFFFFF" : "#111111" }}>
                          ₹{plan.price}
                        </span>
                      </div>

                      <ul className="space-y-1.5 mb-3">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-center gap-2 text-[12px]" style={{ color: plan.popular ? "rgba(255,255,255,0.65)" : "#6B6860" }}>
                            <Check size={10} style={{ color: "#06b6d4" }} strokeWidth={3} />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <motion.button
                        onClick={() => handlePurchase(plan)}
                        disabled={!!loadingId}
                        whileHover={!loadingId ? { scale: 1.01 } : {}}
                        whileTap={!loadingId ? { scale: 0.98 } : {}}
                        className="w-full h-9 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                        style={plan.popular
                          ? { background: "#06b6d4", color: "#FFFFFF" }
                          : { background: "#111111", color: "#FFFFFF" }
                        }
                      >
                        {loadingId === plan.id
                          ? <><Loader2 size={12} className="animate-spin" />Processing…</>
                          : `Upgrade to ${plan.name} — ₹${plan.price}`
                        }
                      </motion.button>
                    </div>
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
