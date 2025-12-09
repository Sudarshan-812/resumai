"use server";

import { createClient } from "@/app/lib/supabase/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  // 1. Verify Signature (Security Check)
  // We hash the orderId and paymentId with your Secret Key.
  // If it matches the signature Razorpay sent, the payment is legit.
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (generatedSignature !== signature) {
    return { success: false, message: "Payment verification failed" };
  }

  // 2. Payment is Real! Add 10 Credits via RPC
  const { error } = await supabase.rpc('increment_credits', { 
    user_id: user.id, 
    amount: 10 
  });

  if (error) {
    console.error("Credit update failed:", error);
    return { success: false, message: "Payment success but DB update failed." };
  }

  // 3. Refresh UI
  revalidatePath('/dashboard');
  revalidatePath('/billing');
  
  return { success: true };
}