"use server";

import { createClient } from "@/app/lib/supabase/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  creditsToAdd: number // 👈 New Argument
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, message: "Unauthorized" };

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(orderId + "|" + paymentId)
    .digest("hex");

  if (generatedSignature !== signature) {
    return { success: false, message: "Payment verification failed" };
  }

  // 👇 Use the dynamic 'creditsToAdd' variable
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
}