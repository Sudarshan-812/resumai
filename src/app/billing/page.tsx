"use client";

import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/app/components/theme-toggle";
import { useState } from "react";
import { createRazorpayOrder } from "@/app/actions/razorpay";
import { verifyPayment } from "@/app/actions/verify-payment"; // 👈 verification import
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePurchase = async () => {
    setLoading(true);

    try {
      // 1. Create Order
      const result = await createRazorpayOrder();
      if (!result.success || !result.orderId) throw new Error("Order creation failed");

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: "9900", // ₹99
        currency: "INR",
        name: "ResumAI Pro",
        description: "10 AI Credits",
        order_id: result.orderId,
        
        // 3. Handle Success
        handler: async function (response: any) {
          toast.loading("Verifying Payment...");
          
          // 4. Call Server Action to Add Credits
          const verification = await verifyPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature
          );

          if (verification.success) {
            toast.dismiss();
            toast.success("Success! 10 Credits Added.");
            router.push("/dashboard"); // Go back to dashboard
            router.refresh();
          } else {
            toast.dismiss();
            toast.error("Verification Failed");
          }
        },
        theme: { color: "#2563EB" },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (error) {
      toast.error("Payment failed to start");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-300">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* Navbar */}
      <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-zinc-500 hover:text-black dark:hover:text-white flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-2">Simple Pricing</h1>
          <p className="text-zinc-500">One time payment. No subscriptions.</p>
        </div>

        <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 border-2 border-blue-600 rounded-xl p-8 shadow-xl">
            <div className="mb-4 text-center">
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase">Pro Bundle</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">10 Credits</h2>
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 text-center mb-6">₹99</div>
            
            <button 
              onClick={handlePurchase}
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Buy Now"}
            </button>
            
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-3 h-3" />
              Secured by Razorpay
            </div>
        </div>
      </main>
    </div>
  );
}