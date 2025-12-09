import { LegalPage } from "@/app/components/legal-layout";

export default function Contact() {
  return (
    <LegalPage title="Contact Us" date="December 9, 2025">
      <p>We are here to help! If you have any questions, concerns, or feedback, please reach out to us.</p>

      <h2>Contact Details</h2>
      <ul className="list-none pl-0 space-y-2">
        <li><strong>Email:</strong> support@resumai.com (Replace with your email)</li>
        <li><strong>Address:</strong> Vijayapura, Karnataka, India (Replace with your city)</li>
      </ul>

      <h2>Support Hours</h2>
      <p>Our team is available Monday to Friday, 9:00 AM to 6:00 PM IST. We aim to respond to all inquiries within 24 hours.</p>
    </LegalPage>
  );
}