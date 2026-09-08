"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import { X, Coins, Check } from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment";
import { toast } from "sonner";
import Script from "next/script";
import { useState } from "react";
import { CREDIT_PACKS } from "@/app/lib/plans";
import type { RazorpayCheckout, RazorpayResponse } from "@/app/lib/razorpay-types";

declare global { interface Window { Razorpay: RazorpayCheckout } }

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  /** Optional context line, e.g. what the user was trying to do. */
  reason?: string;
}

const SPRING = { type: "spring", stiffness: 360, damping: 28 } as const;

export default function UpgradeModal({ open, onClose, onSuccess, reason }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePurchase = async (plan: (typeof CREDIT_PACKS)[number]) => {
    setLoadingId(plan.id);
    try {
      const result = await createRazorpayOrder(plan.priceUsd);
      if (!result.success || !result.orderId) throw new Error("Order creation failed");

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: plan.priceUsd * 100,
        currency: "USD",
        name: `Viva ${plan.name}`,
        description: `${plan.credits} resume analysis credits`,
        order_id: result.orderId,
        handler: async (response: RazorpayResponse) => {
          toast.loading("Verifying payment…");
          const verification = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
          );
          toast.dismiss();
          if (verification.success) {
            toast.success("Credits added. You're all set.");
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
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50"
                  style={{ background: "rgba(17,17,17,0.35)", backdropFilter: "blur(4px)" }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                />
              </DialogPrimitive.Overlay>

              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 16 }}
                  transition={SPRING}
                  className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-3xl overflow-hidden outline-none bg-card border border-border"
                  style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.12)" }}
                >
                  <DialogPrimitive.Title className="sr-only">Get more credits</DialogPrimitive.Title>

                  <div style={{ height: 3, background: "linear-gradient(90deg,#12a594,#008573)" }} />

                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={SPRING}
                    className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground"
                  >
                    <X size={16} />
                  </motion.button>

                  <div className="p-6 pt-5">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 bg-primary/10 border border-primary/20">
                      <Coins size={22} className="text-primary" />
                    </div>

                    <h2 className="font-display text-xl font-semibold mb-1.5 text-foreground">
                      You&apos;re out of credits
                    </h2>
                    <p className="text-[13px] leading-relaxed mb-6 text-muted-foreground">
                      {reason ?? "Each resume analysis uses one credit."}{" "}
                      Grab a pack — one-time, no subscription, credits never expire. Mock interviews stay free.
                    </p>

                    <div className="space-y-3">
                      {CREDIT_PACKS.map((plan, pi) => (
                        <motion.div
                          key={plan.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: pi * 0.07, type: "spring", stiffness: 280, damping: 26 }}
                          className={`rounded-2xl p-4 relative bg-card ${plan.popular ? "border-2 border-primary" : "border border-border"}`}
                        >
                          {plan.popular && (
                            <span className="absolute -top-2.5 left-4 text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-0.5 rounded-full bg-primary text-white">
                              Most popular
                            </span>
                          )}

                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[14px] font-bold text-foreground">
                              {plan.name} · {plan.credits} analyses
                            </span>
                            <div className="text-right">
                              <span className="text-[20px] font-black tabular-nums text-foreground" style={{ letterSpacing: "-0.03em" }}>
                                ${plan.priceUsd}
                              </span>
                              <span className="text-[10px] ml-1 text-muted-foreground">one-time</span>
                            </div>
                          </div>

                          <ul className="space-y-2 mb-4">
                            {plan.features.slice(0, 3).map((f) => (
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
                              : `Get ${plan.name} - $${plan.priceUsd}`
                            }
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-center text-[11px] mt-4 text-muted-foreground/60">
                      One-time · Credits never expire · Secure checkout
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
