import { LegalPage } from "@/app/components/legal-layout";

export default function PrivacyPolicy() {
  return (
    <LegalPage title="Privacy Policy" date="December 9, 2025">
      <p>At ResumAI, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information.</p>
      
      <h2>1. Information We Collect</h2>
      <p>We collect information you provide directly to us, such as when you create an account, upload a resume, or contact support. This includes:</p>
      <ul>
        <li>Name and Email address.</li>
        <li>Resume data (PDF files and parsed text).</li>
        <li>Payment information (processed securely by Razorpay).</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <p>We use your information to provide and improve our services, specifically:</p>
      <ul>
        <li>To analyze your resume and generate AI feedback.</li>
        <li>To process transactions and manage your credits.</li>
        <li>To send you important service updates.</li>
      </ul>

      <h2>3. Data Security</h2>
      <p>We implement industry-standard security measures to protect your data. Your resumes are stored securely using Supabase Storage with strict access controls.</p>
    </LegalPage>
  );
}