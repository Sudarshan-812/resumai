'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden bg-indigo-900 px-6 py-20 text-center md:px-20"
        >
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-purple-500/30 rounded-full blur-[100px]" />
            <div className="absolute bottom-[-50%] right-[-20%] w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
              Ready to land your <br/> dream job?
            </h2>
            <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto mb-10">
              Join 10,000+ developers who are getting more interviews with ResumAI. It takes less than 2 minutes to get your score.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {/* 👇 CHANGED: /signup -> /login */}
              <Link href="/login">
                <Button size="lg" className="w-full sm:w-auto bg-white text-indigo-900 hover:bg-gray-100 text-lg px-8 py-6 rounded-full font-bold transition-transform hover:scale-105">
                  Get Started for Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-indigo-400/30 text-black hover:bg-gray-200 hover:text-black text-lg px-8 py-6 rounded-full font-semibold">
                  Sign In
                </Button>
              </Link>
            </div>
            
            <p className="mt-8 text-sm text-indigo-300 font-medium">
              No credit card required · Cancel anytime
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}