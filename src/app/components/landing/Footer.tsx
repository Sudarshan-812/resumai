"use client";

import Link from "next/link";
import type { FC, JSX } from "react";
import {
  Sparkles,
  Twitter,
  Linkedin,
  Instagram,
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
    name: "Instagram",
    href: "#",
    icon: Instagram,
    ariaLabel: "ResumAI Instagram profile",
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
      className="border-t border-gray-100 bg-white pt-20 pb-10"
      aria-labelledby="footer-heading"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-2xl font-bold text-gray-900">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600"
                aria-hidden="true"
              >
                <Sparkles className="h-4 w-4 fill-white text-white" />
              </div>
              <span>ResumAI</span>
            </div>

            <p className="max-w-xs text-sm leading-relaxed text-gray-500">
              Helping Indian developers land top-tier tech jobs with AI-powered
              resume optimization.
            </p>

            <div className="flex gap-4 pt-4">
              {SOCIAL_LINKS.map(({ name, href, icon: Icon, ariaLabel }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={ariaLabel}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* Product */}
          <nav aria-label="Product" className="space-y-6">
            <h3 className="font-bold text-gray-900">Product</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <Link
                  href="#features"
                  className="transition-colors hover:text-indigo-600"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="transition-colors hover:text-indigo-600"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="transition-colors hover:text-indigo-600"
                >
                  Log In
                </Link>
              </li>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal" className="space-y-6">
            <h3 className="font-bold text-gray-900">Legal</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-indigo-600"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-indigo-600"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="transition-colors hover:text-indigo-600"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </nav>

          {/* Status */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h3 className="mb-2 font-bold text-gray-900">System Status</h3>

            <div
              className="mb-4 flex items-center gap-2 text-sm font-medium text-emerald-600"
              role="status"
              aria-live="polite"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              All Systems Operational
            </div>

            <p className="text-xs text-gray-400">Powered by Gemini 2.0 Flash</p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            © 2025 ResumAI Inc. Built in India 🇮🇳
          </p>

          <div className="flex gap-6 text-xs font-medium text-gray-400">
            <span aria-label="Application version">v2.1.0</span>
            <span aria-label="Server region">Server: Mumbai (AWS)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
