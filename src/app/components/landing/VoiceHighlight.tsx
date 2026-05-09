"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mic, ArrowRight, Zap } from "lucide-react";

export default function VoiceHighlight() {
  return (
    <section
      className="py-16 md:py-24"
      style={{ background: "#0A0A0A", borderTop: "1px solid #161616" }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl p-12 md:p-16 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #0d0d1a 0%, #0f0f18 100%)",
            border: "1px solid rgba(99,102,241,0.25)",
          }}
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "700px",
                height: "400px",
                background: "radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)",
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">

            {/* Animated orb */}
            <div className="relative flex items-center justify-center shrink-0" style={{ width: "140px", height: "140px" }}>
              {/* Ripple rings */}
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  className="absolute rounded-full"
                  style={{
                    width: `${60 + ring * 40}px`,
                    height: `${60 + ring * 40}px`,
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                  animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: ring * 0.35, ease: "easeInOut" }}
                />
              ))}

              {/* Core orb */}
              <motion.div
                animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: "radial-gradient(circle, rgba(99,102,241,0.5) 0%, rgba(99,102,241,0.15) 100%)",
                  border: "1px solid rgba(99,102,241,0.4)",
                  boxShadow: "0 0 40px rgba(99,102,241,0.3)",
                }}
              >
                <Mic size={26} style={{ color: "#a5b4fc" }} strokeWidth={1.5} aria-hidden />
              </motion.div>
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <Zap size={12} style={{ color: "#6366f1" }} aria-hidden />
                <span className="text-xs font-semibold tracking-[0.15em] uppercase font-mono" style={{ color: "#6366f1" }}>
                  New · Voice AI
                </span>
              </div>

              <h2
                className="font-bold text-white tracking-tight mb-4"
                style={{ fontSize: "clamp(24px, 3.5vw, 40px)" }}
              >
                Practice with a real AI interviewer.
              </h2>

              <p className="text-base leading-relaxed mb-8 max-w-lg" style={{ color: "#666666" }}>
                Your AI interviewer reads your actual resume and the target job description — then asks
                real, challenging questions. Powered by LiveKit WebRTC, Groq Llama 3.3, and Deepgram TTS.
              </p>

              <Link
                href="/login"
                className="group inline-flex items-center gap-2 h-11 px-6 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#6366f1" }}
              >
                Start Practice Interview
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
