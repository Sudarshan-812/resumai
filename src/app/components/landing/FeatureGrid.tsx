'use client';
import { motion } from 'framer-motion';
import { FileText, Sparkles, BarChart3, UploadCloud } from 'lucide-react';

const features = [
  {
    title: "Instant ATS Analysis",
    description: "Get a detailed score and actionable feedback to beat Applicant Tracking Systems instantly.",
    icon: BarChart3,
    gradient: "from-blue-500 to-cyan-500",
    className: "md:col-span-2",
  },
  {
    title: "AI Cover Letters",
    description: "Generate tailored cover letters for any job description in seconds.",
    icon: FileText,
    gradient: "from-purple-500 to-pink-500",
    className: "md:col-span-1",
  },
  {
    title: "Gemini 2.0 Model",
    description: "Powered by Google's latest model for reasoning.",
    icon: Sparkles,
    gradient: "from-amber-400 to-orange-500",
    className: "md:col-span-1",
  },
  {
    title: "Smart PDF Parsing",
    description: "We extract text from complex layouts with high accuracy.",
    icon: UploadCloud,
    gradient: "from-emerald-400 to-teal-500",
    className: "md:col-span-2",
  },
];

export default function FeatureGrid() {
  return (
    <section id="features" className="py-32 bg-gray-50 relative overflow-hidden">
      {/* Subtle Mesh Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Everything you need to <br /> 
            <span className="text-indigo-600">land the interview.</span>
          </motion.h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Our tools are designed to give you an unfair advantage in the job market.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className={`group relative p-8 rounded-[2rem] bg-white border border-indigo-50 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 ${feature.className}`}
            >
              {/* Icon with Gradient Background */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${feature.gradient} shadow-lg text-white`}>
                <feature.icon className="h-7 w-7" />
              </div>
              
              <h3 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative Gradient Border on Hover (Pseudo-element trick) */}
              <div className="absolute inset-0 rounded-[2rem] ring-2 ring-transparent group-hover:ring-indigo-100 pointer-events-none transition-all" />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}