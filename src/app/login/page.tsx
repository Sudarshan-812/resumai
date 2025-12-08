import { headers } from "next/headers";
import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PasswordInput } from "@/app/components/password-input";
// 👇 Import the Theme Toggle
import { ThemeToggle } from "@/app/components/theme-toggle";

// --- CUSTOM UI COMPONENTS ---

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const IconBrandGoogle = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  // --- SERVER ACTIONS ---
  
  const signInWithGoogle = async () => {
    "use server";
    const supabase = await createClient();
    const hdr = await headers();
    const origin = hdr.get("origin") ?? `http://localhost:${process.env.PORT ?? 3000}`;
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (data.url) return redirect(data.url);
    if (error) return redirect(`/login?message=${encodeURIComponent("Google auth failed")}`);
  };

  const signIn = async (formData: FormData) => {
    "use server";
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return redirect(`/login?message=${encodeURIComponent(error.message ?? "Sign in failed")}`);
    return redirect("/dashboard");
  };

  const signUp = async (formData: FormData) => {
    "use server";
    const hdr = await headers();
    const origin = hdr.get("origin") ?? `http://localhost:${process.env.PORT ?? 3000}`;
    const email = (formData.get("email") as string) || "";
    const password = (formData.get("password") as string) || "";
    const supabase = await createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${origin}/auth/callback` },
    });

    if (error) return redirect(`/login?message=${encodeURIComponent(error.message ?? "Sign up failed")}`);
    return redirect("/login?message=Check email to continue sign in process");
  };

  return (
    // UPDATED: bg-white for light mode, bg-black for dark mode with transitions
    <div className="min-h-screen w-full bg-white dark:bg-black relative flex flex-col items-center justify-center overflow-hidden transition-colors duration-300">
      
      {/* BACKGROUND GRID - ADAPTIVE COLORS */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none z-0",
          "[background-size:40px_40px]",
          // Light Mode Grid (Light Gray) vs Dark Mode Grid (Dark Gray)
          "[background-image:linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)]",
          "dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
        )}
      />
      {/* Vignette Effect (Adaptive) */}
      <div className="absolute inset-0 z-0 bg-white dark:bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      {/* TOP BAR: Back Button + Theme Toggle */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50">
        <Link 
          href="/" 
          className="text-neutral-600 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-sm group font-medium"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>
        {/* Toggle Button */}
        <ThemeToggle />
      </div>

      {/* HEADER */}
      <div className="relative z-10 text-center mb-8 px-4">
        <h2 className="font-bold text-3xl text-neutral-900 dark:text-neutral-200 tracking-tight">
          Welcome to ResumAI
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm max-w-sm mt-2 mx-auto">
          Login to your dashboard to manage your resumes and credits.
        </p>
      </div>

      {/* LOGIN BOX - GLASSMORPHISM ADAPTIVE */}
      <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-2xl bg-white/70 dark:bg-zinc-950/50 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 relative z-10">
        
        <form className="my-2">
          
          <div className="flex flex-col space-y-4">
            <LabelInputContainer>
              <label htmlFor="email" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
              <input
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                className={cn(
                  "flex h-10 w-full border-none rounded-md px-3 py-2 text-sm transition-all duration-200",
                  "bg-gray-50 dark:bg-zinc-800", // Background
                  "text-neutral-900 dark:text-white", // Text
                  "placeholder:text-neutral-400 dark:placeholder:text-neutral-600", // Placeholder
                  "shadow-sm focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600"
                )}
                required
              />
            </LabelInputContainer>
            
            <LabelInputContainer>
              <label htmlFor="password" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Password</label>
              {/* Uses the updated PasswordInput we made earlier */}
              <PasswordInput />
            </LabelInputContainer>

            <button
              className="bg-gradient-to-br from-indigo-600 to-violet-600 w-full text-white rounded-md h-12 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] relative group/btn hover:from-indigo-500 hover:to-violet-500 transition-all mt-4"
              formAction={signIn}
              type="submit"
            >
              Sign In &rarr;
              <BottomGradient />
            </button>

            <button
              className="bg-transparent border border-gray-300 dark:border-zinc-700 w-full text-neutral-600 dark:text-neutral-300 rounded-md h-10 font-medium relative group/btn hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all text-sm"
              formAction={signUp}
            >
              No account? Sign Up
            </button>
          </div>

          <div className="bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-700 to-transparent my-8 h-[1px] w-full" />

          <button
            formAction={signInWithGoogle}
            className="relative group/btn flex space-x-2 items-center justify-center px-4 w-full text-neutral-700 dark:text-white rounded-md h-12 font-medium shadow-sm bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all duration-200"
            type="submit"
          >
            <IconBrandGoogle className="h-5 w-5" />
            <span className="text-sm">
              Sign in with Google
            </span>
            <BottomGradient />
          </button>
        </form>

        {message && (
          <div className="mt-4 p-3 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center animate-in fade-in slide-in-from-top-2">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}