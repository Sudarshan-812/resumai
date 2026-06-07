"use server";

import Razorpay from "razorpay";
import { createClient } from "@/app/lib/supabase/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

// Server-side authoritative amount (paise) → credits map.
// Never trust the client to tell us how many credits a payment is worth.
const PLAN_CREDITS: Record<number, number> = {
  4900: 5,   // ₹49  Starter
  9900: 12,  // ₹99  Pro
  19900: 30, // ₹199 Premium
};

// Amounts that also upgrade the interview plan tier.
const PLAN_UPGRADE: Record<number, string> = {
  9900:  "pro",     // ₹99  → unlimited interviews + voice
  19900: "premium", // ₹199 → same perks + more credits
};

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
) {
  try {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      return { success: false, message: "Payment service is misconfigured. Contact support." };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, message: "Unauthorized" };

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature !== signature) {
      return { success: false, message: "Payment verification failed" };
    }

    // Fetch the order from Razorpay to get the authoritative amount.
    // This prevents clients from manipulating how many credits they receive.
    // Issue 6: Wrap with a 10-second timeout so a slow Razorpay response doesn't hang.
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const order = await Promise.race([
      razorpay.orders.fetch(orderId),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Razorpay order fetch timed out")), 10_000)
      ),
    ]);
    const paidAmountPaise = Number(order.amount);

    const creditsToAdd = PLAN_CREDITS[paidAmountPaise];
    if (!creditsToAdd) {
      return { success: false, message: "Unrecognized payment amount. Please contact support." };
    }

    const { error } = await supabase.rpc("increment_credits", {
      user_id: user.id,
      amount: creditsToAdd,
    });

    if (error) {
      return { success: false, message: "Payment received but credit update failed. Contact support with your payment ID." };
    }

    // Upgrade plan tier if this payment unlocks Pro or Premium
    const planToUpgrade = PLAN_UPGRADE[paidAmountPaise];
    if (planToUpgrade) {
      await supabase.rpc("set_user_plan", {
        p_user_id: user.id,
        p_plan: planToUpgrade,
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/billing");
    revalidatePath("/dashboard/interview");

    return { success: true, creditsAdded: creditsToAdd, planUpgraded: planToUpgrade ?? null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error during payment verification.";
    return { success: false, message };
  }
}
