"use client";

import { Dialog as DialogPrimitive } from "radix-ui";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkle } from "@phosphor-icons/react";

const SPRING = { type: "spring", stiffness: 360, damping: 28 } as const;

interface Props {
  open: boolean;
  onClose: () => void;
  /** Optional plan name to personalise the copy. */
  planName?: string;
}

/**
 * Shown when someone tries to buy a credit pack. Checkout isn't live yet -
 * flip `PAYMENTS_ENABLED` in the billing surfaces once it is.
 */
export default function ComingSoonDialog({ open, onClose, planName }: Props) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50"
                style={{ background: "rgba(17,17,17,0.35)", backdropFilter: "blur(4px)" }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              />
            </DialogPrimitive.Overlay>

            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 16 }}
                transition={SPRING}
                className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-3xl overflow-hidden outline-none bg-card border border-border"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.12)" }}
              >
                <DialogPrimitive.Title className="sr-only">Checkout coming soon</DialogPrimitive.Title>

                <div style={{ height: 3, background: "linear-gradient(90deg,#12a594,#008573)" }} />

                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>

                <div className="p-6 pt-5">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4 bg-primary/10 border border-primary/20">
                    <Sparkle size={22} className="text-primary" weight="fill" />
                  </div>

                  <h2 className="font-display text-xl font-semibold mb-1.5 text-foreground">
                    Checkout is coming soon
                  </h2>
                  <p className="text-[13px] leading-relaxed mb-6 text-muted-foreground">
                    {planName ? <>Thanks for picking <span className="font-semibold text-foreground">{planName}</span>. </> : null}
                    Paid credit packs aren&apos;t live just yet. In the meantime, resume scoring&apos;s
                    free trial and the AI mock interview - voice and text - are free to use.
                  </p>

                  <div className="flex flex-col gap-2">
                    <a
                      href="mailto:sudarshankulkarni812@gmail.com?subject=Viva%20early%20access"
                      className="h-10 rounded-xl text-[13px] font-bold flex items-center justify-center text-white"
                      style={{ background: "linear-gradient(135deg,#12a594,#008573)" }}
                    >
                      Ask for early access
                    </a>
                    <button
                      onClick={onClose}
                      className="h-10 rounded-xl text-[13px] font-semibold border border-border text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Got it
                    </button>
                  </div>
                </div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
