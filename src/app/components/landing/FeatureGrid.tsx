'use client';
import { motion } from 'framer-motion';
import { FileText, Sparkles, BarChart3, UploadCloud } from 'lucide-react';

const features = [
  {
    title: "Instant ATS Analysis",
    description: "Get a detailed score and actionable feedback to beat the Applicant Tracking Systems.",
    icon: BarChart3,
    color: "bg-blue-50 text-blue-600",
    delay: 0.1,
    className: "md:col-span-2",
  },
  {
    title: "AI Cover Letters",
    description: "Generate tailored cover letters for any job description in seconds.",
    icon: FileText,
    color: "bg-purple-50 text-purple-600",
    delay: 0.2,
    className: "md:col-span-1",
  },
  {
    title: "Gemini 2.0 Flash",
    description: "Powered by Google's latest model for lightning-fast reasoning.",
    icon: Sparkles,
    color: "bg-amber-50 text-amber-600",
    delay: 0.3,
    className: "md:col-span-1",
  },
  {
    title: "Smart PDF Parsing",
    description: "We extract text from your complex PDF resumes with high accuracy.",
    icon: UploadCloud,
    color: "bg-green-50 text-green-600",
    delay: 0.4,
    className: "md:col-span-2",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-gray-900"
          >
            Everything you need to <br /> land the interview.
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: feature.delay }}
              whileHover={{ y: -5 }}
              /* 👇 CHANGED: border-gray-200 -> border-black */
              className={`p-8 rounded-3xl border border-black bg-white shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all ${feature.className}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}