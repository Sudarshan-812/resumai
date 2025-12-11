"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { User, LogOut, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/"; // Force reload to clear Navbar state
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-black text-white pt-32 px-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user?.email}</h1>
              <span className="inline-block mt-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
                Free Plan
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-black rounded-xl border border-zinc-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Sparkles className="text-yellow-500" size={20} />
                <span>Credits Remaining</span>
              </div>
              <span className="font-mono font-bold">3 / 3</span>
            </div>
            
            <button 
              onClick={handleLogout}
              className="w-full py-4 mt-8 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 font-bold flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}