"use client";

import Link from "next/link";
import { FileDashed as FileQuestion, ArrowLeft, House as Home } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <FileQuestion className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-3">
            404 — Not Found
          </p>
          <h1 className="font-display text-3xl font-bold text-foreground mb-3 tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:opacity-90 text-white text-sm font-semibold transition-opacity shadow-lg shadow-primary/20"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
