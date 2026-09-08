"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { CoinLoader } from "./coin-loader";

const SAFETY_TIMEOUT_MS = 4000;

// Routes inside the app shell. They have their own Suspense skeletons
// (loading.tsx) plus the page transition in app/template.tsx, so a
// full-screen blocking loader here would only hide that motion.
const SHELL_PREFIXES = ["/dashboard", "/history", "/billing", "/settings"];
const isShellPath = (p: string) =>
  SHELL_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + "/"));

export function RouteLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const key = `${pathname}?${searchParams?.toString() ?? ""}`;

  const [loading, setLoading] = useState(false);
  const [settledKey, setSettledKey] = useState(key);
  const latestKeyRef = useRef(key);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (settledKey !== key) {
    setSettledKey(key);
    if (loading) setLoading(false);
  }

  useEffect(() => {
    latestKeyRef.current = key;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  }, [key]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (`${url.pathname}${url.search}` === latestKeyRef.current.replace(/\?$/, "")) return;

      // Skip navigations within (or into) the app shell — let its own
      // skeletons + page transition play instead of covering them.
      if (isShellPath(url.pathname) || isShellPath(window.location.pathname)) return;

      setLoading(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setLoading(false), SAFETY_TIMEOUT_MS);
    }

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/70 backdrop-blur-sm">
      <CoinLoader size={72} />
    </div>
  );
}
