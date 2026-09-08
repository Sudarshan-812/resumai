/** Minimal client-side types for the Razorpay Checkout script. */

export interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key?: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  theme?: { color?: string };
  prefill?: { name?: string; email?: string; contact?: string };
}

export interface RazorpayCheckout {
  new (options: RazorpayOptions): { open: () => void };
}
