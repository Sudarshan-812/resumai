"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lightning as Zap, Check } from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment";
import { toast } from "sonner";
import Script from "next/script";

declare global { interface Window { Razorpay: any } }

interface Props {
  open: boolean;
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
    features: ["Unlimited interviews / month", "12 resume scan credits", "Priority support"],
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

export default function UpgradeModal({ open, onClose, onSuccess }: Props) {
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
        name: `Viva ${plan.name}`,
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
            toast.error("Verification failed - contact support with your payment ID.");
          }
        },
        theme: { color: "#12a594" },
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

      <DialogPrimitive.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
        <AnimatePresence>
          {open && (
            <DialogPrimitive.Portal forceMount>
              {/* Backdrop */}
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50"
                  style={{ background: "rgba(17,17,17,0.35)", backdropFilter: "blur(4px)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                />
              </DialogPrimitive.Overlay>

              {/* Modal */}
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 16 }}
                  transition={SPRING}
                  className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl overflow-hidden outline-none bg-card border border-border"
                  style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.12)" }}
                >
                <DialogPrimitive.Title className="sr-only">
                  Interview Limit Reached
                </DialogPrimitive.Title>
              {/* Teal accent stripe */}
              <div style={{ height: 3, background: "linear-gradient(90deg,#12a594,#008573)" }} />

              {/* Close */}
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={SPRING}
                className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground"
              >
                <X size={16} />
              </motion.button>

              <div className="p-6 pt-5">
                {/* Icon + heading */}
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 bg-primary/10 border border-primary/20">
                  <Zap size={22} className="text-primary" />
                </div>

                <h2 className="font-display text-xl font-semibold mb-1.5 text-foreground">
                  Interview Limit Reached
                </h2>
                <p className="text-[13px] leading-relaxed mb-6 text-muted-foreground">
                  You've used all 3 free interviews this month. Upgrade to practice without limits.
                </p>

                {/* Plans */}
                <div className="space-y-3">
                  {PLANS.map((plan, pi) => (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: pi * 0.07, type: "spring", stiffness: 280, damping: 26 }}
                      className={`rounded-2xl p-4 relative bg-card ${plan.popular ? "border-2 border-primary" : "border border-border"}`}
                    >
                      {/* Popular badge */}
                      {plan.popular && (
                        <span className="absolute -top-2.5 left-4 text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full bg-primary text-white">
                          Recommended
                        </span>
                      )}

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[14px] font-bold text-foreground">{plan.name}</span>
                        <div className="text-right">
                          <span className="text-[20px] font-black tabular-nums text-foreground" style={{ letterSpacing: "-0.03em" }}>
                            ₹{plan.price}
                          </span>
                          <span className="text-[10px] ml-1 text-muted-foreground">one-time</span>
                        </div>
                      </div>

                      <ul className="space-y-2 mb-4">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[12px] text-muted-foreground">
                            <Check size={14} weight="bold" className="shrink-0 text-primary mt-0.5" />
                            {f}
                          </li>
                        ))}
                      </ul>

                      <motion.button
                        onClick={() => handlePurchase(plan)}
                        disabled={!!loadingId}
                        whileHover={!loadingId ? { y: -1, boxShadow: "0 10px 24px rgba(18,165,148,0.28)" } : {}}
                        whileTap={!loadingId ? { scale: 0.98 } : {}}
                        transition={SPRING}
                        className="w-full h-9 rounded-xl text-[12px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg,#12a594,#008573)", color: "#FFFFFF", boxShadow: "0 4px 14px rgba(18,165,148,0.2)" }}
                      >
                        {loadingId === plan.id
                          ? <><CoinLoader size={16} className="text-current" />Processing…</>
                          : `Upgrade to ${plan.name} - ₹${plan.price}`
                        }
                      </motion.button>
                    </motion.div>
                  ))}
                </div>

                <p className="text-center text-[11px] mt-4 text-muted-foreground/60">
                  One-time · Credits never expire · Secure via Razorpay
                </p>
              </div>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          )}
        </AnimatePresence>
      </DialogPrimitive.Root>
    </>
  );
}
