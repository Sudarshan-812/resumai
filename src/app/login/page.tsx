"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client"; 
import { useRouter } from "next/navigation";
import { Loader2, Mail, Lock, Sparkles, ArrowRight, CheckCircle2, Eye, EyeOff, Github, Star } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm signup!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      
      {/* --- LEFT SIDE: VISUAL & TESTIMONIAL (Light Gray BG) --- */}
      <div className="hidden lg:flex flex-col justify-between p-16 relative bg-gray-50 border-r border-gray-100 overflow-hidden">
        
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Soft Gradient Blob */}
        <div className="absolute top-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-xl mb-16 group">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 fill-white" />
            </div>
            <span className="text-gray-900 tracking-tight">ResumAI</span>
          </Link>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-md"
          >
            <h1 className="text-5xl font-extrabold mb-6 leading-[1.1] tracking-tight text-gray-900">
              Your career, <br/>
              <span className="text-indigo-600">accelerated.</span>
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed">
              ResumAI helps you craft ATS-friendly resumes, generate tailored cover letters, and prepare for interviews 10x faster.
            </p>
          </motion.div>
        </div>

        {/* Floating Testimonial Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10"
        >
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-xl shadow-gray-200/50 max-w-md">
             <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(i => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
             </div>
             <p className="text-gray-700 font-medium mb-6 leading-relaxed">
               "I've used every resume builder out there. ResumAI is the only one that actually improved my content, not just the formatting. Landed a job at Google!"
             </p>
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
                   AK
                </div>
                <div>
                   <p className="text-gray-900 font-semibold text-sm">Arjun K.</p>
                   <p className="text-gray-500 text-xs">Product Manager</p>
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* --- RIGHT SIDE: LOGIN FORM (Pure White) --- */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative bg-white">
        <div className="w-full max-w-[400px] space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
             <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
               <Sparkles className="w-5 h-5 fill-white" />
             </div>
          </div>

          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              {isSignUp 
                ? "Start building your winning resume in seconds." 
                : "Enter your details to access your workspace."}
            </p>
          </div>

          <div className="space-y-4">
            
            {/* SOCIAL BUTTONS */}
            <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl transition-all text-sm font-semibold shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                      <path d="M12 4.66c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>
                <button
                  disabled={isLoading} 
                  className="flex items-center justify-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 py-2.5 rounded-xl transition-all text-sm font-semibold shadow-sm"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-400 font-medium">Or continue with</span>
              </div>
            </div>

            {/* EMAIL FORM */}
            <form onSubmit={handleEmailAuth} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 ml-1">Work Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-semibold text-gray-700">Password</label>
                    {!isSignUp && (
                        <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">Forgot password?</a>
                    )}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-10 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 mt-4"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSignUp ? "Create Account" : "Sign In"}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-gray-500 mt-8">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors hover:underline underline-offset-4"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}