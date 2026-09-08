import { LegalPage } from "@/app/components/legal-layout";

export default function Contact() {
  return (
    <LegalPage title="Contact Us" date="December 9, 2025">
      <p>We are here to help. If you have any questions, concerns, or feedback about Viva, please reach out.</p>

      <h2>Contact Details</h2>
      <ul className="list-none pl-0 space-y-2">
        <li><strong>Email:</strong> <a href="mailto:sudarshankulkarni812@gmail.com">sudarshankulkarni812@gmail.com</a></li>
        <li><strong>Support:</strong> Email is the fastest way to reach us.</li>
      </ul>

      <h2>Support Hours</h2>
      <p>We review messages Monday to Friday, 9:00 AM to 6:00 PM Eastern Time (ET), and aim to respond to every inquiry within one business day.</p>
    </LegalPage>
  );
}