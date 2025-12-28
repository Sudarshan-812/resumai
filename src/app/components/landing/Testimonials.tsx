'use client';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';

const testimonials = [
  {
    quote: "I was getting rejected instantly. After ResumAI optimized my CV, I got 3 interview calls in a week.",
    author: "Arjun K.",
    role: "Frontend Developer",
    initial: "A",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    quote: "The cover letter generator is magic. It actually sounds like me, but professional.",
    author: "Sarah J.",
    role: "Product Manager",
    initial: "S",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    quote: "Simple, fast, and effective. The ATS scoring feature is a game changer.",
    author: "David R.",
    role: "Data Scientist",
    initial: "D",
    gradient: "from-amber-500 to-orange-600"
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50 overflow-hidden relative">
      
      {/* --- Light Background Gradients --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-100/60 rounded-full blur-[80px]" />
         <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-100/60 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Trusted by <span className="text-indigo-600">10,000+</span> job seekers
          </motion.h2>
          <p className="text-gray-500">Join the community landing top-tier tech jobs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              /* Premium Light Card Styling */
              className="p-8 rounded-3xl bg-white border border-indigo-50 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <Quote className="w-8 h-8 text-indigo-100 mb-4" />
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed font-medium">"{t.quote}"</p>
              
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center font-bold text-white text-sm shadow-md`}>
                  {t.initial}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t.author}</p>
                  <p className="text-sm text-gray-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}