import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-8 text-zinc-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
        
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 font-bold text-white text-lg mb-4">
            <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            ResumAI
          </Link>
          <p className="leading-relaxed mb-6 max-w-xs">
            AI-powered career tools to help you optimize your resume and get hired faster.
          </p>
        </div>

        {/* Product Column */}
        <div className="col-span-1">
          <h3 className="text-white font-bold mb-4 tracking-wide uppercase text-xs">Product</h3>
          <ul className="space-y-3">
            <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            <li><Link href="/billing" className="hover:text-white transition-colors">Pricing</Link></li>
          </ul>
        </div>

        {/* Legal Column (REQUIRED FOR RAZORPAY) */}
        <div className="col-span-1">
          <h3 className="text-white font-bold mb-4 tracking-wide uppercase text-xs">Legal</h3>
          <ul className="space-y-3">
            <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/cancellation-refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
            <li><Link href="/shipping-delivery" className="hover:text-white transition-colors">Shipping Policy</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="col-span-1">
          <h3 className="text-white font-bold mb-4 tracking-wide uppercase text-xs">Support</h3>
          <ul className="space-y-3">
            <li><Link href="/contact-us" className="hover:text-white transition-colors">Contact Us</Link></li>
            <li><a href="mailto:support@resumai.com" className="hover:text-white transition-colors">Email Support</a></li>
          </ul>
        </div>

      </div>
      
      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
        <p>© 2025 ResumAI. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </div>
    </footer>
  );
}