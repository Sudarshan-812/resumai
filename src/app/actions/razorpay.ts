"use server";

import Razorpay from "razorpay";

// 👇 Notice we now accept 'amount' as an argument
export async function createRazorpayOrder(amount: number) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Validations
    if (!amount) throw new Error("Amount is required");

    const options = {
      amount: amount * 100, // Convert ₹49 to 4900 paise
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return { success: false, error: "Failed to create order" };
  }
}