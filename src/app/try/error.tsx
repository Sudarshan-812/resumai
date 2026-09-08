"use client";

import Link from "next/link";
import { WarningCircle, ArrowClockwise } from "@phosphor-icons/react";

export default function TryError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <WarningCircle className="w-8 h-8 text-amber-500" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The analysis hit an unexpected error. Your file was not stored — you can try again.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowClockwise className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center h-11 px-5 rounded-xl border border-border bg-card text-foreground text-sm font-semibold hover:bg-muted transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
