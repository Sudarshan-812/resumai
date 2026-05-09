"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Twitter, Linkedin, Github } from "lucide-react";

const PRODUCT_LINKS = [
  { label: "Capabilities",  href: "/#features"      },
  { label: "How it works",  href: "/#how-it-works"  },
  { label: "Pricing",       href: "/#pricing"        },
  { label: "Sign In",       href: "/login"           },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy",       href: "/privacy-policy"       },
  { label: "Terms",         href: "/terms-and-conditions" },
  { label: "Refund Policy", href: "/cancellation-refund"  },
  { label: "Contact",       href: "/contact-us"           },
] as const;

const SOCIAL_LINKS = [
  { icon: Twitter,  href: "#", label: "ResumAI Twitter"  },
  { icon: Linkedin, href: "#", label: "ResumAI LinkedIn" },
  { icon: Github,   href: "#", label: "ResumAI GitHub"   },
] as const;

export default function Footer() {
  return (
    <footer
      aria-labelledby="footer-heading"
      style={{ background: "#0A0A0A", borderTop: "1px solid #161616" }}
    >
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* CTA block */}
      <div className="py-24" style={{ borderBottom: "1px solid #161616" }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto px-6 text-center"
        >
          <h2
            className="font-bold text-white tracking-tight mb-4"
            style={{ fontSize: "clamp(28px, 4vw, 44px)" }}
          >
            Your next interview starts<br />with your resume.
          </h2>
          <p className="text-sm leading-relaxed mb-8 max-w-xs mx-auto" style={{ color: "#666666" }}>
            Upload and get your ATS score in under 10 seconds. No account required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/try"
              className="group inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#6366f1" }}
            >
              Try Free — No Login
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center h-11 px-6 rounded-xl text-sm font-medium transition-colors hover:text-white"
              style={{ background: "#111111", border: "1px solid #1a1a1a", color: "#888888" }}
            >
              Create Account
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-16" style={{ borderBottom: "1px solid #161616" }}>

          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: "#6366f1" }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <rect x="2" y="1" width="12" height="14" rx="2" stroke="white" strokeWidth="1.5" />
                  <path d="M5 5h6M5 8h6M5 11h3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-white">ResumAI</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[220px]" style={{ color: "#555555" }}>
              AI-powered resume optimization for the modern job market.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="transition-colors hover:text-white"
                  style={{ color: "#444444" }}
                >
                  <Icon size={15} aria-hidden />
                </Link>
              ))}
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product links" className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#444444" }}>Product</h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "#666666" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal links" className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#444444" }}>Legal</h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm transition-colors hover:text-white" style={{ color: "#666666" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Status */}
          <div className="rounded-xl p-5" style={{ background: "#111111", border: "1px solid #1a1a1a" }}>
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#444444" }}>
              Global Status
            </h3>
            <div className="flex items-center gap-2 text-xs font-medium" style={{ color: "#34d399" }} role="status">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              All systems operational
            </div>
            <div
              className="mt-4 pt-4 text-[10px] font-mono"
              style={{ color: "#444444", borderTop: "1px solid #1a1a1a" }}
            >
              v2.1.0 · Gemini Flash 2.0
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div
          className="py-6 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="text-xs" style={{ color: "#444444" }}>
            © 2026 ResumAI. Made in India 🇮🇳
          </p>
          <div className="flex gap-6 text-[10px] font-mono uppercase tracking-wider" style={{ color: "#333333" }}>
            <span>Mumbai-AW-1</span>
            <span>24ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
