"use server";

import Razorpay from "razorpay";

// TODO(payments): Viva is priced and sold in USD. Razorpay must have
// international / USD card payments enabled on the account for this to settle,
// otherwise migrate this action + verify-payment.ts to Stripe (needs Stripe
// keys + a webhook). The rest of the app is already currency-agnostic.
export async function createRazorpayOrder(amountUsd: number) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    if (!amountUsd || amountUsd <= 0) throw new Error("Amount is required");

    const options = {
      amount: Math.round(amountUsd * 100), // cents
      currency: "USD",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return { success: true, orderId: order.id };
  } catch {
    return { success: false, error: "Failed to create order" };
  }
}
