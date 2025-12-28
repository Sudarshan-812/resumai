'use client';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "I was getting rejected instantly. After ResumAI optimized my CV, I got 3 interview calls in a week.",
    author: "Arjun K.",
    role: "Frontend Developer",
  },
  {
    quote: "The cover letter generator is magic. It actually sounds like me, but professional.",
    author: "Sarah J.",
    role: "Product Manager",
  },
  {
    quote: "Simple, fast, and effective. The ATS scoring feature is a game changer.",
    author: "David R.",
    role: "Data Scientist",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16 text-gray-900">Trusted by job seekers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              /* 👇 CHANGED: border-gray-100 -> border-black */
              className="p-8 rounded-2xl bg-white border border-black shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-lg text-gray-700 mb-6 italic">"{t.quote}"</p>
              <div>
                <p className="font-bold text-gray-900">{t.author}</p>
                <p className="text-sm text-gray-500">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}