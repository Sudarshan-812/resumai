'use client';
import { motion } from 'framer-motion';
import { Upload, Wand2, Download } from 'lucide-react';

const steps = [
  {
    title: "Upload Resume",
    desc: "Drop your existing PDF. We parse it instantly.",
    icon: Upload,
  },
  {
    title: "AI Analysis",
    desc: "Our engine scores it against your target job.",
    icon: Wand2,
  },
  {
    title: "Optimize & Export",
    desc: "Apply fixes and download the ATS-ready version.",
    icon: Download,
  },
];

export default function HowItWorks() {
  return (
    /* 👇 CHANGED: border-gray-100 -> border-black (Top Border) */
    <section id="how-it-works" className="py-24 bg-white border-t border-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">How it works</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Three simple steps to your dream job.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connector Line (Desktop) */}
          {/* 👇 CHANGED: bg-gray-100 -> bg-black (Solid black line) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-black" />

          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center z-10"
            >
              {/* 👇 CHANGED: border-gray-100 -> border-black */}
              <div className="w-24 h-24 rounded-full bg-white border border-black flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50">
                <step.icon className="w-10 h-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">{step.title}</h3>
              <p className="text-gray-500">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}