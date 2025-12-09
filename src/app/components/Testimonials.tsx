"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  { name: "Rahul S.", role: "IIT Student", text: "Got 3 interviews in a week! ATS score 95%.", rating: 5 },
  { name: "Priya K.", role: "NIT Fresher", text: "Pro plan worth every penny — AI fixed my typos instantly.", rating: 5 },
  { name: "Amit R.", role: "BITS Alum", text: "Templates look pro. Downloaded 5 versions in 10 mins.", rating: 4.8 },
  { name: "Sneha M.", role: "DU Grad", text: "Basic plan was enough for my startup job app.", rating: 5 },
];

export default function Testimonials() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      className="py-16 bg-gradient-to-r from-purple-900/20 to-pink-900/20"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">What Students Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10"
            >
              <div className="flex justify-center mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-4 h-4 ${j < t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`} />
                ))}
              </div>
              <p className="text-sm mb-2 italic">"{t.text}"</p>
              <p className="font-semibold text-white">{t.name}</p>
              <p className="text-xs text-gray-400">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}