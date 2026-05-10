"use client";

import type { FC, JSX } from "react";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, Globe, Command
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Button } from "@/components/ui/button";

const EASE = [0.16, 1, 0.3, 1] as const;

const LoginPage: FC = (): JSX.Element => {
  const [email, setEmail]               = useState<string>("");
  const [password, setPassword]         = useState<string>("");
  const [isLoading, setIsLoading]       = useState<boolean>(false);
  const [isSignUp, setIsSignUp]         = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [forgotSent, setForgotSent]     = useState<boolean>(false);

  const router   = useRouter();
  const supabase = createClient();

  const handleForgotPassword = useCallback(async (): Promise<void> => {
    if (!email) { toast.error("Enter your email address above first."); return; }
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setForgotSent(true);
      toast.success("Password reset link sent! Check your inbox.");
    } catch { toast.error("Failed to send reset email."); }
    finally { setIsLoading(false); }
  }, [email, supabase]);

  const handleGoogleLogin = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch { toast.error("Google login failed"); setIsLoading(false); }
  }, [supabase]);

  const handleEmailAuth = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();
      setIsLoading(true);
      try {
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({
            email, password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          });
          if (error) throw error;
          toast.success("Check your email to confirm your signup.");
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          toast.success("Welcome back!");
          router.push("/dashboard");
          router.refresh();
        }
      } catch { toast.error("Authentication failed"); }
      finally { setIsLoading(false); }
    },
    [email, password, isSignUp, router, supabase]
  );

  return (
    <div className="grid h-screen w-screen overflow-hidden bg-background lg:grid-cols-2">

      {/* ── Left panel — brand / animation ── */}
      <div className="relative hidden h-full flex-col border-r border-border bg-muted/20 p-10 lg:flex">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          {/* Logo top-left */}
          <Image
            src="/column8_black_transparent.png"
            alt="Column8"
            width={560}
            height={217}
            className="h-8 w-auto"
            priority
          />
          <div className="flex items-center gap-4 opacity-40">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-foreground">Auth.Protocol.v2</span>
              <div className="h-px w-12 bg-border" />
              <div className="flex items-center gap-1.5">
                <Globe size={10} />
                <span className="text-[10px] font-mono uppercase tracking-tight">Mumbai-AW-1</span>
              </div>
            </div>
            <Command size={14} />
          </div>
        </div>

        {/* Centre content */}
        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-md space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="space-y-4"
            >
              <h1 className="font-display text-5xl text-foreground leading-[1.05] tracking-tight">
                Engineering the <br />
                <span className="text-primary">Perfect Handshake.</span>
              </h1>
              <p className="text-muted-foreground leading-relaxed text-base max-w-sm">
                Access the infrastructure used by engineers to bridge the gap between human expertise and ATS logic.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-background/50 shadow-2xl shadow-primary/5"
            >
              <DotLottieReact
                src="https://lottie.host/1360d328-a6ba-4191-8a54-d40814f1a103/zLX5NEX06c.lottie"
                loop
                autoplay
                className="h-full w-full opacity-80"
              />

              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-xl border border-border bg-background/80 p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Neural Pipeline Active</span>
                </div>
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck size={12} />
                  <span className="text-[9px] font-bold font-mono">ENCRYPTED</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 flex items-center justify-between border-t border-border/50">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">© 2026 // Column8 Platform</span>
          <div className="flex items-center gap-4 opacity-50">
            <div className="h-1.5 w-1.5 rounded-full bg-border" />
            <div className="h-1.5 w-1.5 rounded-full bg-border" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          </div>
        </div>
      </div>

      {/* ── Right panel — auth form ── */}
      <div className="relative flex h-full items-center justify-center p-6 sm:p-12 bg-background">

        {/* Mobile: logo top-left */}
        <div className="absolute top-6 left-6 lg:hidden">
          <Image
            src="/column8_black_transparent.png"
            alt="Column8"
            width={560}
            height={217}
            className="h-7 w-auto"
            priority
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="w-full max-w-[360px] space-y-8 mt-16 lg:mt-0"
        >
          <div className="text-center">
            <h2 className="font-display text-3xl text-foreground mb-2 font-bold tracking-tight">
              {isSignUp ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isSignUp ? "Enter your details to start optimizing." : "Access your workspace and reports."}
            </p>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full h-11 rounded-xl border-border bg-background hover:bg-muted font-medium transition-all active:scale-[0.98]"
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/>
              <path d="M12 4.66c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.19 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-border" />
            <span className="mx-4 text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">OR</span>
            <div className="flex-grow border-t border-border" />
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full h-10 rounded-lg border border-border bg-muted/20 pl-10 pr-4 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="text-[11px] font-bold text-primary hover:underline disabled:opacity-50"
                  >
                    {forgotSent ? "Email sent ✓" : "Forgot?"}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 rounded-lg border border-border bg-muted/20 pl-10 pr-10 text-sm font-medium focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-all active:scale-[0.98]"
            >
              {isLoading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <>{isSignUp ? "Create Account" : "Sign In"} <ArrowRight className="ml-2 h-4 w-4" /></>
              }
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsSignUp((v) => !v)}
              className="font-bold text-primary hover:underline"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
