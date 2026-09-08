"use client";

import { Check, ShieldCheck, Lightning as Zap, Star, ArrowRight } from "@phosphor-icons/react";
import { CoinLoader } from "@/components/ui/coin-loader";
import { useState } from "react";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment";
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { CREDIT_PACKS } from "@/app/lib/plans";
import type { RazorpayCheckout, RazorpayResponse } from "@/app/lib/razorpay-types";
import ComingSoonDialog from "@/app/components/ComingSoonDialog";

declare global { interface Window { Razorpay: RazorpayCheckout } }

// Flip to true once real checkout is wired up (Razorpay USD / Stripe).
const PAYMENTS_ENABLED = false;

const PLANS = CREDIT_PACKS;

export default function BillingPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async (plan: typeof PLANS[number]) => {
    if (!PAYMENTS_ENABLED) {
      setComingSoon(plan.name);
      return;
    }
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
          toast.loading("Verifying payment...");
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
        theme: { color: "#12a594" },
      });
      rzp.open();
    } catch {
      toast.error("Payment failed to start.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="mx-auto max-w-5xl px-6 md:px-8 py-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">Billing</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Pay once, keep forever. No subscriptions. Credits are for resume analyses and never expire - AI mock interviews stay free.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col rounded-lg border bg-white p-5",
                plan.popular ? "border-primary" : "border-border"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[12px] font-semibold text-foreground">{plan.name}</p>
                {plan.popular && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
                    <Star size={9} weight="fill" /> Popular
                  </span>
                )}
              </div>

              <p className="text-[12px] leading-relaxed text-muted-foreground mb-5">{plan.description}</p>

              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-[34px] font-semibold tabular-nums tracking-tight text-foreground leading-none">
                  ${plan.priceUsd}
                </span>
              </div>
              <p className="text-[11.5px] text-muted-foreground mb-5">one-time - {plan.credits} credits</p>

              <div className="h-px bg-border mb-4" />

              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f, fi) => (
                  <li key={fi} className="flex items-start gap-2 text-[12.5px] text-muted-foreground">
                    <Check size={14} weight="bold" className="shrink-0 mt-0.5 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePurchase(plan)}
                disabled={!!loadingId}
                className={cn(
                  "group w-full h-9 rounded-md text-[13px] font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:pointer-events-none",
                  plan.popular
                    ? "bg-primary hover:bg-[#0f9184] text-white"
                    : "border border-border text-foreground hover:bg-[#f8f8f9]"
                )}
              >
                {loadingId === plan.id ? (
                  <><CoinLoader size={15} className="text-current" /> Processing...</>
                ) : (
                  <>Get {plan.name} <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" /></>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Trust strip */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-10 py-5 border-t border-border">
          {[
            { icon: ShieldCheck, text: "Secure checkout" },
            { icon: Zap, text: "Instant activation" },
            { icon: Check, text: "Credits never expire" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon size={16} className="text-muted-foreground" />
              <span className="text-[12px] font-medium text-muted-foreground">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <ComingSoonDialog
        open={comingSoon !== null}
        onClose={() => setComingSoon(null)}
        planName={comingSoon ?? undefined}
      />
    </>
  );
}
