"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, ArrowRight, Zap } from "lucide-react";

export default function VoiceHighlight() {
  return (
    <section
      className="py-0"
      style={{ background: "#0E7490" }}
    >
      <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
        <div className="relative overflow-hidden">

          {/* Ambient texture */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "30%",
                transform: "translate(-50%, -50%)",
                width: "600px",
                height: "400px",
                background: "radial-gradient(ellipse, rgba(255,255,255,0.06) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">

            {/* Animated orb */}
            <div className="relative flex items-center justify-center shrink-0" style={{ width: "140px", height: "140px" }}>
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute rounded-full"
                  style={{
                    width: `${60 + ring * 40}px`,
                    height: `${60 + ring * 40}px`,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                  animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: ring * 0.35, ease: "easeInOut" }}
                />
              ))}

              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  boxShadow: "0 0 40px rgba(255,255,255,0.1)",
                }}
              >
                <Mic size={26} color="white" strokeWidth={1.5} aria-hidden />
              </motion.div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <Zap size={12} color="rgba(255,255,255,0.7)" aria-hidden />
                <span className="text-xs font-semibold tracking-[0.15em] uppercase font-mono" style={{ color: "rgba(255,255,255,0.6)" }}>
                  New · Voice AI
                </span>
              </div>

              <h2
                className="font-display font-bold tracking-tight mb-4"
                style={{ fontSize: "clamp(24px, 3.5vw, 40px)", color: "#FFFFFF" }}
              >
                Practice with a real AI interviewer.
              </h2>

              <p className="text-base leading-relaxed mb-8 max-w-lg" style={{ color: "rgba(255,255,255,0.65)" }}>
                Your AI interviewer reads your actual resume and the target job description — then asks
                real, challenging questions. Powered by LiveKit WebRTC, Groq Llama 3.3, and Deepgram TTS.
              </p>

              <Link
                href="/login"
                className="group inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                style={{ background: "#FFFFFF", color: "#0E7490" }}
              >
                Start Practice Interview
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
