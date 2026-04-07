"use server";

import { createClient } from "@/app/lib/supabase/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  creditsToAdd: number
) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
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

    const { error } = await supabase.rpc('increment_credits', {
      user_id: user.id,
      amount: creditsToAdd
    });

    if (error) {
      return { success: false, message: "Payment success but DB update failed." };
    }

    revalidatePath('/dashboard');
    revalidatePath('/billing');

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error during payment verification.";
    return { success: false, message };
  }
}