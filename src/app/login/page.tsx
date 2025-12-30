"use client";

import type { FC, JSX } from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Lock,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoginPage: FC = (): JSX.Element => {
  // Auth form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const router = useRouter();
  const supabase = createClient();

  // Google OAuth login
  const handleGoogleLogin = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Google login failed";
      toast.error(message);
      setIsLoading(false);
    }
  }, [supabase]);

  // Email Auth
  const handleEmailAuth = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();
      setIsLoading(true);
      try {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw error;
          toast.success("Check your email to confirm your signup.");
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
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, isSignUp, router, supabase]
  );

  return (
    <div className="grid h-screen w-screen overflow-hidden bg-white lg:grid-cols-2">
      
      {/* Left panel */}
      <div className="relative hidden h-full flex-col overflow-hidden border-r border-gray-100 bg-gray-50 p-8 lg:flex">
        
        {/* Background texture */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Gradient blobs */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[-20%] top-[-20%] h-[600px] w-[600px] rounded-full bg-indigo-500/5 blur-[100px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-20%] right-[-20%] h-[600px] w-[600px] rounded-full bg-purple-500/5 blur-[100px]"
        />

        <div className="relative z-10 flex h-full w-full flex-col">
          {/* Logo */}
          <Link
            href="/"
            className="group mb-4 flex items-center gap-2.5 text-xl font-bold w-fit"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 fill-white" />
            </div>
            <span className="tracking-tight text-gray-900">
              ResumAI
            </span>
          </Link>

          {/* Animation Container */}
          <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
            <div className="w-full h-full max-h-full">
              <DotLottieReact
                src="https://lottie.host/1360d328-a6ba-4191-8a54-d40814f1a103/zLX5NEX06c.lottie"
                loop
                autoplay
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: Auth Form */}
      <div className="relative flex h-full items-center justify-center bg-white p-6 sm:p-12">
        <div className="w-full max-w-[400px] space-y-6">
          
          {/* Mobile logo */}
          <div className="flex justify-center lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
              <Sparkles className="h-5 w-5 fill-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              {isSignUp
                ? "Start building your winning resume."
                : "Enter your details to access your workspace."}
            </p>
          </div>

          {/* Social login (Only Google) */}
          <div className="w-full">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
                <path d="M12 4.66c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 font-medium text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1.5">
              <label className="ml-1 text-xs font-semibold text-gray-700">Work Email</label>
              <div className="group relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-indigo-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 font-medium text-gray-900 placeholder:text-gray-400 transition-all focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="ml-1 flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                {!isSignUp && (
                  <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="group relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 transition-colors group-focus-within:text-indigo-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-10 font-medium text-gray-900 placeholder:text-gray-400 transition-all focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-black hover:shadow-xl disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSignUp ? "Create Account" : "Sign In"}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp((prev) => !prev)}
              className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;