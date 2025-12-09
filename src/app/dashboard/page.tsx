import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  FileText, BarChart3, TrendingUp, CreditCard, 
  Sparkles, Plus, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/app/components/theme-toggle"; 

// --- HELPER: De-Duplicate Resumes ---
function getUniqueResumes(resumes: any[]) {
  if (!resumes) return [];
  const uniqueMap = new Map();
  
  resumes.forEach((resume) => {
    if (!uniqueMap.has(resume.file_name)) {
      const score = resume.analyses?.[0]?.ats_score || 0;
      uniqueMap.set(resume.file_name, {
        ...resume,
        ats_score: score
      });
    }
  });
  
  return Array.from(uniqueMap.values());
}

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 1. Fetch Resumes + Linked Analysis Score
  const { data: rawResumes } = await supabase
    .from("resumes")
    .select("*, analyses(ats_score)") 
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // 2. Fetch Real Credits from Profiles
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  const credits = profile?.credits ?? 0;

  // 3. Process Data
  const resumes = getUniqueResumes(rawResumes || []);
  const totalScans = resumes.length;
  
  const avgScore = resumes.length 
    ? Math.round(resumes.reduce((acc, curr) => acc + (curr.ats_score || 0), 0) / resumes.length) 
    : 0;

  const scoreColor = avgScore >= 80 ? "text-emerald-500" : avgScore >= 60 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#09090b] text-gray-900 dark:text-white transition-colors duration-300">
      
      {/* Background Pattern */}
      <div className={cn(
        "fixed inset-0 pointer-events-none z-0 opacity-30 dark:opacity-20",
        "[background-size:24px_24px]",
        "[background-image:linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)]",
        "dark:[background-image:linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)]"
      )} />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-gray-200 dark:border-zinc-800 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white dark:text-black fill-current" />
            </div>
            <span className="font-bold text-lg tracking-tight">ResumAI</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500 dark:text-zinc-400">
              <Link href="/dashboard" className="text-black dark:text-white transition-colors">Overview</Link>
              <Link href="/billing" className="hover:text-black dark:hover:text-white transition-colors">Billing</Link>
              <Link href="/settings" className="hover:text-black dark:hover:text-white transition-colors">Settings</Link>
            </div>
            
            <div className="h-6 w-px bg-gray-200 dark:bg-zinc-800 hidden sm:block" />
            
            <div className="relative">
               <ThemeToggle />
            </div>

            <form action="/auth/signout" method="post">
              <button className="text-gray-500 dark:text-zinc-500 hover:text-black dark:hover:text-white transition-colors text-sm font-medium">
                Log out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-400">Manage your resume analysis and track your performance.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-sm">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-xs font-medium text-gray-600 dark:text-zinc-300">System Operational</span>
          </div>
        </div>

        {/* 👇 UPGRADE BANNER 👇 */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                  Pro Feature
                </span>
                <span className="flex items-center gap-1 text-indigo-100 text-sm font-medium">
                  <Sparkles className="w-3 h-3" /> Get 10x more interviews
                </span>
              </div>
              <h2 className="text-2xl font-bold mb-2">Running low on credits?</h2>
              <p className="text-indigo-100 max-w-lg">
                Unlock the full power of AI. Get detailed resume analysis, cover letters, and LinkedIn optimization starting at just ₹49.
              </p>
            </div>
            <Link 
              href="/billing"
              className="whitespace-nowrap rounded-xl bg-white text-indigo-600 px-8 py-3 font-bold shadow-lg transition-transform hover:scale-105 hover:bg-gray-50 flex items-center gap-2"
            >
              Get Credits <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        </div>
        {/* 👆 END BANNER 👆 */}

        {/* Create New Scan Card */}
        <Link href="/upload" className="block group">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-8 sm:p-12 text-center transition-all duration-300 hover:shadow-lg dark:hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)] hover:border-gray-300 dark:hover:border-zinc-600">
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all duration-300">
                <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Create New Scan</h2>
              <p className="text-sm sm:text-base text-gray-500 dark:text-zinc-400 max-w-md mx-auto">
                Upload your resume PDF to get an instant AI analysis, ATS score calculation, and improvement suggestions.
              </p>
            </div>
          </div>
        </Link>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 mb-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total Scans</span>
            </div>
            <div className="text-3xl font-mono font-medium text-gray-900 dark:text-white">{totalScans}</div>
          </div>

          <div className="p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Average Score</span>
            </div>
            <div className={cn("text-3xl font-mono font-medium", scoreColor)}>{avgScore}</div>
          </div>

          <div className="p-5 sm:p-6 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm">
            <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 mb-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Credits</span>
            </div>
            <div className="text-3xl font-mono font-medium text-gray-900 dark:text-white">
              {credits}
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider ml-1">Recent Activity</h3>
          
          <div className="rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 divide-y divide-gray-100 dark:divide-zinc-800 shadow-sm overflow-hidden">
            {(!resumes || resumes.length === 0) ? (
              <div className="p-8 text-center text-gray-500 dark:text-zinc-500 text-sm">
                No activity yet.
              </div>
            ) : (
              resumes.map((resume) => (
                <Link href={`/dashboard/${resume.id}`} key={resume.id} className="block group">
                  <div className="flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                    
                    {/* Left Side: Icon + Truncated Name */}
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1 mr-4">
                      <div className="h-10 w-10 shrink-0 rounded bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-500 dark:text-zinc-400 group-hover:bg-black dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-colors">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-900 dark:text-zinc-200 group-hover:text-black dark:group-hover:text-white transition-colors truncate">
                          {resume.file_name || "Untitled Resume"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-zinc-500 font-mono mt-0.5 truncate">
                          {new Date(resume.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side: Score + Arrow */}
                    <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                      <div className="text-right">
                        <div className={cn("text-sm font-bold font-mono", 
                          (resume.ats_score || 0) >= 80 ? "text-emerald-500" : 
                          (resume.ats_score || 0) >= 60 ? "text-amber-500" : 
                          "text-rose-500"
                        )}>
                          {resume.ats_score || 0}/100
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 dark:text-zinc-600 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

      </main>
    </div>
  );
}