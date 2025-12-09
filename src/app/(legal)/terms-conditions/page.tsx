import { LegalPage } from "@/app/components/legal-layout";

export default function Terms() {
  return (
    <LegalPage title="Terms and Conditions" date="December 9, 2025">
      <p>Welcome to ResumAI. By accessing or using our website, you agree to be bound by these Terms and Conditions.</p>

      <h2>1. Usage of Service</h2>
      <p>ResumAI provides AI-powered resume analysis. You agree to use the service only for lawful purposes and not to upload any content that is illegal, offensive, or violates the rights of others.</p>

      <h2>2. Accounts and Credits</h2>
      <p>You must create an account to use certain features. Credits purchased are non-transferable and are used to perform AI scans.</p>

      <h2>3. Limitation of Liability</h2>
      <p>ResumAI is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the service, including employment outcomes.</p>
    </LegalPage>
  );
}