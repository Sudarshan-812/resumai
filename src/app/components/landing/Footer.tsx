"use client";

import Link from "next/link";
import type { FC, JSX } from "react";
import {
  Sparkles,
  Twitter,
  Linkedin,
  Github,
  type LucideIcon,
} from "lucide-react";

interface SocialLink {
  name: string;
  href: string;
  icon: LucideIcon;
  ariaLabel: string;
}

const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    name: "Twitter",
    href: "#",
    icon: Twitter,
    ariaLabel: "ResumAI Twitter profile",
  },
  {
    name: "LinkedIn",
    href: "#",
    icon: Linkedin,
    ariaLabel: "ResumAI LinkedIn profile",
  },
  {
    name: "GitHub",
    href: "#",
    icon: Github,
    ariaLabel: "ResumAI GitHub repository",
  },
];

const Footer: FC = (): JSX.Element => {
  return (
    <footer
      className="border-t border-border bg-background pt-20 pb-10"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          
          {/* Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold tracking-tight text-foreground">ResumAI</span>
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Engineering the layer where LLMs meet your career goals. Optimized for the modern tech landscape.
            </p>

            <div className="flex gap-5">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon, ariaLabel }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={ariaLabel}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Columns */}
          <nav aria-label="Product" className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Product</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-primary transition-colors">Capabilities</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary transition-colors">Infrastructure</Link></li>
              <li><Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal" className="space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-foreground">Legal</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="/terms-and-conditions" className="hover:text-primary transition-colors">Terms</Link></li>
              <li><Link href="/cancellation-refund" className="hover:text-primary transition-colors">Refund Policy</Link></li>
              <li><Link href="/contact-us" className="hover:text-primary transition-colors">Contact Support</Link></li>
            </ul>
          </nav>

          {/* System Status - Enterprise Card */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Global Status</h3>

            <div
              className="mb-4 flex items-center gap-2.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Operational
            </div>

            <div className="pt-4 border-t border-border mt-auto">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-tight">
                    v2.1.0 // Gemini-Flash-2
                </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground font-medium">
            © 2026 ResumAI Inc. Built for developers 🇮🇳
          </p>

          <div className="flex gap-6 text-[10px] font-mono uppercase tracking-tight text-muted-foreground/60">
            <span aria-label="Server region">Region: Mumbai-AW-1</span>
            <span aria-label="Deployment status">Latency: 24ms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;