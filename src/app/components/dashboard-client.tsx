"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, FileText, BarChart3, Settings, 
  Menu, X, Sparkles, Search, Bell, CreditCard, 
  LogOut, UploadCloud, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";

interface DashboardClientProps {
  user: any;
  profile: any;
  recentResumes: any[];
  stats: {
    totalScans: number;
    avgScore: number;
  };
}

export default function DashboardClient({ user, profile, recentResumes, stats }: DashboardClientProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false); // Loading state for logout
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const userName = profile?.full_name?.split(' ')[0] || "Developer";
  const credits = profile?.credits ?? 0;
  const { totalScans, avgScore } = stats;

  // --- 1. Handle Logout ---
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh();
    } catch (error) {
      toast.error("Error signing out");
    } finally {
      setIsSigningOut(false);
    }
  };

  // --- 2. Helper to clean filenames (Fixes .pdf.pdf) ---
  const cleanFileName = (name: string) => {
    return name.replace(/\.pdf$/i, "").replace(/[_-]/g, " ");
  };

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/" className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-200">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">ResumAI</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1">
          <NavItem href="/dashboard" icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" currentPath={pathname} />
          <NavItem href="/dashboard/resumes" icon={<FileText className="w-5 h-5" />} label="My Resumes" currentPath={pathname} />
          <NavItem href="/dashboard/analytics" icon={<BarChart3 className="w-5 h-5" />} label="Analytics" currentPath={pathname} />
          <NavItem href="/dashboard/settings" icon={<Settings className="w-5 h-5" />} label="Settings" currentPath={pathname} />
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 mb-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {userName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          
          {/* Logout Button Added Here */}
          <button 
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 overflow-hidden">
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-md">
              <Menu className="w-6 h-6" />
            </button>
            <div className="lg:hidden font-bold text-slate-800">ResumAI</div>
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-slate-800">{getGreeting()}, {userName}</h1>
              <p className="text-sm text-slate-500">Here's what's happening with your job search.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-sm font-medium">
              <CreditCard className="w-4 h-4" />
              <span>{credits} Credits</span>
              {/* Linked Buy Button to Pricing/Billing */}
              <Link href="/pricing" className="ml-1 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full hover:bg-indigo-700 transition">
                Buy
              </Link>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition"><Search className="w-5 h-5" /></button>
            <button className="p-2 text-slate-400 hover:text-slate-600 transition"><Bell className="w-5 h-5" /></button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 space-y-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* ... (Hero/Upload section remains the same) ... */}
          
          {/* 1. Hero / Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 group relative overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
               {/* ... Content same as previous ... */}
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white pointer-events-none" />
               <div className="relative p-8 flex flex-col sm:flex-row items-center gap-8 h-full">
                  <div className="flex-1 text-center sm:text-left">
                     <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4">
                        <Sparkles className="w-3 h-3" /> New Analysis
                     </div>
                     <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload your Resume</h2>
                     <p className="text-slate-500 mb-6 leading-relaxed">
                        Get an instant ATS score, AI-powered feedback, and tailored interview questions in seconds.
                     </p>
                     <Link href="/upload">
                        <button className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all hover:scale-105 flex items-center justify-center gap-2">
                           <UploadCloud className="w-5 h-5" />
                           Select PDF File
                        </button>
                     </Link>
                  </div>
                  {/* ... Decoration same as previous ... */}
                  <div className="relative w-48 h-48 flex-shrink-0 hidden sm:flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-dashed border-indigo-200 rounded-2xl animate-[spin_10s_linear_infinite]" />
                    <div className="absolute inset-4 border border-indigo-100 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      <FileText className="w-12 h-12 text-indigo-300" />
                    </div>
                  </div>
               </div>
            </div>

            <div className="md:col-span-1 space-y-6">
               <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
                  <div>
                     <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Average ATS Score</p>
                     <div className="mt-4 flex items-end gap-2">
                        <span className={cn("text-5xl font-bold tracking-tight", 
                           avgScore >= 80 ? "text-emerald-600" : avgScore >= 60 ? "text-amber-500" : "text-rose-500"
                        )}>
                           {avgScore}
                        </span>
                        <span className="text-slate-400 font-medium mb-2">/100</span>
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                     <p className="text-xs text-slate-500">Based on your last {totalScans} resumes</p>
                     <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
                        <div 
                           className={cn("h-full rounded-full transition-all duration-1000", 
                           avgScore >= 80 ? "bg-emerald-500" : avgScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                           )} 
                           style={{ width: `${avgScore}%` }} 
                        />
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* 2. Quick Tools Grid */}
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ToolCard title="Cover Letter" desc="Generate from JD" icon={<FileText className="text-purple-600" />} color="bg-purple-50 hover:border-purple-200" />
              <ToolCard title="Interview Prep" desc="AI Mock Questions" icon={<BarChart3 className="text-blue-600" />} color="bg-blue-50 hover:border-blue-200" />
              <ToolCard title="Resume Rewrite" desc="Polish Bullet Points" icon={<Sparkles className="text-amber-600" />} color="bg-amber-50 hover:border-amber-200" />
              <ToolCard title="Settings" desc="Manage Account" icon={<Settings className="text-slate-600" />} color="bg-slate-50 hover:border-slate-300" />
            </div>
          </div>

          {/* 3. Recent Resumes List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Recent Analyses</h3>
              <Link href="/dashboard/resumes" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
             
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {recentResumes.length === 0 ? (
                 <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UploadCloud className="w-8 h-8 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 font-medium">No resumes yet</h3>
                    <p className="text-slate-500 text-sm mt-1">Upload your first resume to see it here.</p>
                 </div>
              ) : (
                 <div className="divide-y divide-slate-100">
                   {recentResumes.map((resume) => (
                     <Link key={resume.id} href={`/dashboard/${resume.id}`} className="block group">
                       <div className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                         <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-105 transition-transform">
                           <FileText className="w-6 h-6" />
                         </div>
                         <div className="flex-1 min-w-0">
                           {/* CLEANED FILE NAME HERE */}
                           <h4 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors capitalize">
                             {cleanFileName(resume.file_name)}
                           </h4>
                           <p className="text-xs text-slate-500 mt-0.5">
                             Analyzed on {new Date(resume.created_at).toLocaleDateString()}
                           </p>
                         </div>
                         <div className="text-right">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                              resume.ats_score >= 80 ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              resume.ats_score >= 60 ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-rose-50 text-rose-700 border-rose-200"
                            )}>
                              {resume.ats_score} / 100
                            </span>
                         </div>
                         <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                       </div>
                     </Link>
                   ))}
                 </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon, label, currentPath }: { href: string, icon: any, label: string, currentPath: string }) {
  const isActive = href === "/dashboard" 
    ? currentPath === "/dashboard" 
    : currentPath.startsWith(href);

  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        isActive 
          ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm border border-indigo-100" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function ToolCard({ title, desc, icon, color }: { title: string, desc: string, icon: any, color: string }) {
  return (
    <button className={cn(
      "flex flex-col items-start p-4 rounded-xl border border-transparent transition-all duration-200 group text-left",
      color
    )}>
      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="font-bold text-slate-800 text-sm">{title}</span>
      <span className="text-xs text-slate-500">{desc}</span>
    </button>
  );
}