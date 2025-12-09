import { LegalPage } from "@/app/components/legal-layout";

export default function Refunds() {
  return (
    <LegalPage title="Cancellation & Refund Policy" date="December 9, 2025">
      <p>We strive to provide the best AI analysis service. Please read our cancellation and refund policy carefully.</p>

      <h2>1. Cancellation</h2>
      <p>Since ResumAI operates on a pay-as-you-go credit model, there are no subscriptions to cancel. You can simply stop using the service at any time.</p>

      <h2>2. Refunds</h2>
      <p>Due to the digital nature of our product (AI Analysis), we generally do not offer refunds once credits have been used. However, if you faced a technical error where credits were deducted but no analysis was provided, please contact us within 7 days for a full refund.</p>
      
      <h2>3. Processing Refunds</h2>
      <p>Approved refunds will be processed within 5-7 business days to the original payment method.</p>
    </LegalPage>
  );
}