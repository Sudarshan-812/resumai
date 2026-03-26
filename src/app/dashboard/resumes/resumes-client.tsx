"use client";

import { useRouter } from "next/navigation";
import { FileText, Clock, Activity } from "lucide-react";
import DashboardNavbar from "@/app/dashboard/dashboard-navbar";

export default function ResumesClient({ user, profile }: { user: any, profile: any }) {
  const userName = profile?.full_name?.split(' ')[0] || "Developer";
  const userInitial = userName[0] || "D";
  const credits = profile?.credits ?? 0;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      
      {/* FIXED: Removed the onSignOut and isSigningOut props */}
      <DashboardNavbar 
        userProfile={{ 
          name: userName, 
          email: user.email, 
          credits, 
          initial: userInitial 
        }}
      />

      <main className="mx-auto max-w-6xl px-6 pt-32 pb-12">
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
          
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted border border-border shadow-sm">
            <Clock className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          
          <h1 className="text-3xl font-serif font-bold text-foreground tracking-tight mb-4">
            Pipeline History
          </h1>
          
          <p className="max-w-md text-sm text-muted-foreground leading-relaxed">
            Our engineering team is finalizing the timeline view. Soon, you will be able to access and manage all your past telemetry and edits here.
          </p>
          
          <div className="mt-8 inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-mono font-bold uppercase tracking-widest text-primary shadow-sm">
            <span className="mr-2 flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary"></span>
            </span>
            Deployment Pending
          </div>
          
        </div>
      </main>
    </div>
  );
}