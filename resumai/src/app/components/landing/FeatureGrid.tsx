'use client';
import { motion } from 'framer-motion';
import { FileText, Bot, Sparkles, BarChart3, UploadCloud, Lock } from 'lucide-react';

const features = [
  {
    title: "Instant ATS Analysis",
    description: "Get a detailed score and actionable feedback to beat the Applicant Tracking Systems.",
    icon: BarChart3,
    color: "bg-blue-500/10 text-blue-500",
    delay: 0.1,
    className: "md:col-span-2", // This card is wide
  },
  {
    title: "AI Cover Letters",
    description: "Generate tailored cover letters for any job description in seconds.",
    icon: FileText,
    color: "bg-purple-500/10 text-purple-500",
    delay: 0.2,
    className: "md:col-span-1",
  },
  {
    title: "Gemini 2.0 Flash",
    description: "Powered by Google's latest model for lightning-fast reasoning.",
    icon: Sparkles,
    color: "bg-amber-500/10 text-amber-500",
    delay: 0.3,
    className: "md:col-span-1",
  },
  {
    title: "Smart PDF Parsing",
    description: "We extract text from your complex PDF resumes with high accuracy.",
    icon: UploadCloud,
    color: "bg-green-500/10 text-green-500",
    delay: 0.4,
    className: "md:col-span-2", // This card is wide
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-zinc-950 text-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
          >
            Everything you need to <br /> land the interview.
          </motion.h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay }}
              whileHover={{ scale: 1.02 }}
              className={`p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm ${feature.className}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}