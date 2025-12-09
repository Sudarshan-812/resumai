"use server";

import Razorpay from "razorpay";

export async function createRazorpayOrder() {
  try {
    // Initialize Razorpay with your private keys
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const options = {
      amount: 99 * 100, // Amount in paise (100 paise = ₹1)
      currency: "INR",
      receipt: "order_rcptid_" + Date.now(),
    };

    // Create the order on Razorpay's server
    const order = await razorpay.orders.create(options);

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    return { success: false, error: "Failed to create order" };
  }
}