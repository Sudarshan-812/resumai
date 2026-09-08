"use server";

import Razorpay from "razorpay";
import { createClient } from "@/app/lib/supabase/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { sendPaymentReceiptEmail } from "@/app/lib/email";
import { CREDITS_BY_CENTS } from "@/app/lib/plans";

// Server-side authoritative amount (cents) → credits map, derived from the
// single pricing source of truth. Never trust the client to tell us how many
// credits a payment is worth.
const PLAN_CREDITS = CREDITS_BY_CENTS;

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
    const paidAmountCents = Number(order.amount);

    const creditsToAdd = PLAN_CREDITS[paidAmountCents];
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

    revalidatePath("/dashboard");
    revalidatePath("/billing");

    // Fire-and-forget receipt email - never block the payment confirmation
    if (user.email) {
      sendPaymentReceiptEmail({
        to: user.email,
        creditsAdded: creditsToAdd,
        planUpgraded: null,
        paymentId,
      }).catch(() => {});
    }

    return { success: true, creditsAdded: creditsToAdd, planUpgraded: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error during payment verification.";
    return { success: false, message };
  }
}
