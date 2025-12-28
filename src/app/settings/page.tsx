"use client";

import type { FC, JSX } from "react";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/app/lib/supabase/client";

const SettingsPage: FC = (): JSX.Element => {
  const router = useRouter();
  const supabase = createClient();

  // Logged-in user fetched from Supabase auth
  const [user, setUser] = useState<User | null>(null);

  // Used to block UI until auth status is known
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch current user on mount
  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Redirect unauthenticated users to login
      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setIsLoading(false);
    };

    fetchUser();
  }, [router, supabase]);

  // Sign out and hard-refresh to reset global UI (navbar, caches, etc.)
  const handleLogout = useCallback(async (): Promise<void> => {
    await supabase.auth.signOut();
    window.location.href = "/";
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-6 pt-32 text-white">
      <div className="mx-auto max-w-2xl">
        {/* Back navigation */}
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8">
          {/* User header */}
          <div className="mb-8 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-3xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>

            <div>
              <h1 className="text-2xl font-bold">{user?.email}</h1>
              <span className="mt-2 inline-block rounded-full border border-indigo-500/20 bg-indigo-500/20 px-3 py-1 text-xs font-bold text-indigo-400">
                Free Plan
              </span>
            </div>
          </div>

          {/* Account info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-black p-4">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-yellow-500" />
                <span>Credits Remaining</span>
              </div>
              <span className="font-mono font-bold">3 / 3</span>
            </div>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 py-4 font-bold text-red-500 transition-all hover:bg-red-500/10"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
