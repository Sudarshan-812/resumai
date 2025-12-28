'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Sparkles, 
  BarChart3, 
  UploadCloud, 
  ArrowUpRight,
  type LucideIcon 
} from 'lucide-react';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  delay: number;
  className: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: 'ats-score',
    title: "Instant ATS Score",
    description: "Don't get filtered out. See exactly how applicant tracking systems view your resume.",
    icon: BarChart3,
    gradient: "from-blue-500 to-cyan-500",
    delay: 0.1,
    className: "md:col-span-2",
  },
  {
    id: 'ai-cover-letters',
    title: "AI Cover Letters",
    description: "Tailored to the job description in < 5 seconds.",
    icon: FileText,
    gradient: "from-purple-500 to-pink-500",
    delay: 0.2,
    className: "md:col-span-1",
  },
  {
    id: 'gemini-logic',
    title: "Gemini 2.0 Logic",
    description: "Reasoning capabilities that beat standard GPT-4 wrappers.",
    icon: Sparkles,
    gradient: "from-amber-400 to-orange-500",
    delay: 0.3,
    className: "md:col-span-1",
  },
  {
    id: 'pdf-parsing',
    title: "Smart PDF Parsing",
    description: "We extract text from complex layouts with 99% accuracy.",
    icon: UploadCloud,
    gradient: "from-emerald-400 to-teal-500",
    delay: 0.4,
    className: "md:col-span-2",
  },
];

interface FeatureCardProps {
  feature: FeatureItem;
}

const FeatureCard = memo(({ feature }: FeatureCardProps) => {
  const { title, description, icon: Icon, gradient, delay, className } = feature;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      whileHover={{ y: -5 }}
      className={`group relative p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-shadow duration-300 ${className}`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br ${gradient} shadow-lg text-white transform group-hover:scale-110 transition-transform duration-300`}
        aria-hidden="true"
      >
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="text-2xl font-bold mb-3 text-gray-900">
        {title}
      </h3>
      
      <p className="text-gray-500 leading-relaxed mb-6">
        {description}
      </p>

      <div 
        className="flex items-center text-sm font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0"
        aria-hidden="true"
      >
        Learn more <ArrowUpRight className="ml-1 w-4 h-4" />
      </div>
    </motion.div>
  );
});

FeatureCard.displayName = 'FeatureCard';

export default function FeatureGrid() {
  return (
    <section 
      id="features" 
      aria-labelledby="features-heading"
      className="py-32 bg-slate-50 relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <h2 
            id="features-heading"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight"
          >
            Features that get you <span className="text-indigo-600">hired.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            We've packed everything you need into one simple dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}