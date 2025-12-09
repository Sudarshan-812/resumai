import { LegalPage } from "@/app/components/legal-layout";

export default function Shipping() {
  return (
    <LegalPage title="Shipping & Delivery Policy" date="December 9, 2025">
      <p>ResumAI is a digital SaaS product. We do not ship physical products.</p>

      <h2>1. Digital Delivery</h2>
      <p>All services (Resume Analysis, Cover Letters, Interview Prep) are delivered digitally and instantly upon successful processing of your request.</p>

      <h2>2. Access to Credits</h2>
      <p>Upon successful payment, credits are immediately added to your account dashboard. You will receive a confirmation email with your transaction details.</p>

      <h2>3. Issues with Delivery</h2>
      <p>If you do not receive your credits immediately after payment, please contact our support team with your Transaction ID.</p>
    </LegalPage>
  );
}