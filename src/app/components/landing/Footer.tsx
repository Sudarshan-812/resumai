"use client";

import Link from "next/link";
import type { FC, JSX } from "react";
import { motion } from "framer-motion";
import { Twitter, Linkedin, Github, ArrowRight, type LucideIcon } from "lucide-react";

interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
  ariaLabel: string;
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  { name: "Twitter",  href: "#", icon: Twitter,  ariaLabel: "ResumAI Twitter profile" },
  { name: "LinkedIn", href: "#", icon: Linkedin, ariaLabel: "ResumAI LinkedIn profile" },
  { name: "GitHub",   href: "#", icon: Github,   ariaLabel: "ResumAI GitHub repository" },
];

const Footer: FC = (): JSX.Element => {
  return (
    <footer className="border-t border-border bg-background" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>

      {/* ── CTA Band ── */}
      <div className="border-b border-border py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl px-6 text-center"
        >
          <h2 className="font-serif text-[clamp(2rem,4vw,3rem)] text-foreground tracking-[-0.02em] leading-[1.1] mb-4">
            Your next interview starts<br />with your resume.
          </h2>
          <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Upload your resume and get an ATS score in under 10 seconds.
            No account required to start.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/try">
              <motion.div
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                className="group relative inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-md overflow-hidden cursor-pointer hover:bg-primary/90 transition-colors"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12 pointer-events-none"
                  animate={{ x: ["-150%", "150%"] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                />
                <span className="relative z-10">Try Free — No Login</span>
                <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </motion.div>
            </Link>
            <Link href="/login">
              <div className="inline-flex h-12 items-center rounded-xl border border-border bg-card/60 px-8 text-sm font-medium text-foreground transition-all hover:bg-muted/50 cursor-pointer">
                Create Account
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ── Footer Links ── */}
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4 pt-20">

          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <rect x="2" y="1" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M5 5h6M5 8h6M5 11h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">ResumAI</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Engineering the layer where LLMs meet your career goals. Optimized for the modern tech landscape.
            </p>
            <div className="flex gap-5">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon, ariaLabel }) => (
                <Link key={name} href={href} aria-label={ariaLabel} className="text-muted-foreground transition-colors hover:text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product" className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/#features"    className="hover:text-primary transition-colors">Capabilities</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">Infrastructure</Link></li>
              <li><Link href="/#pricing"     className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/login"        className="hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal" className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy"       className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</Link></li>
              <li><Link href="/cancellation-refund"  className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact-us"           className="hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </nav>

          {/* Status */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Global Status</h3>
            <div className="mb-4 flex items-center gap-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400" role="status" aria-live="polite">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Operational
            </div>
            <div className="pt-4 border-t border-border">
              <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">
                v2.1.0 // Gemini-Flash-2.5
              </p>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-8 pb-10 md:flex-row">
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 ResumAI Inc. Built for developers 🇮🇳
          </p>
          <div className="flex gap-6 text-[10px] font-mono uppercase tracking-tight text-muted-foreground/60">
            <span>Region: Mumbai-AW-1</span>
            <span>Latency: 24ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
