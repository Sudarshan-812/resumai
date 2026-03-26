import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 2. Parallel Data Fetching (Eliminates Waterfalls)
  const [resumesResponse, profileResponse, countResponse] = await Promise.all([
    // Fetch recent activity
    supabase
      .from("resumes")
      .select("id, file_name, created_at, analyses(ats_score)") 
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
    
    // Fetch profile details
    supabase
      .from("profiles")
      .select("credits, full_name")
      .eq("id", user.id)
      .single(),

    // Fetch total count for accurate stats
    supabase
      .from("resumes")
      .select("*", { count: 'exact', head: true })
      .eq("user_id", user.id)
  ]);

  // 3. Data Transformation
  const rawResumes = resumesResponse.data || [];
  const profile = profileResponse.data;
  const totalScansCount = countResponse.count || 0;

  const recentResumes = rawResumes.map((r: any) => ({
    ...r,
    ats_score: r.analyses?.[0]?.ats_score || 0
  }));

  // Calculate Average Score from the recent batch
  const avgScore = recentResumes.length > 0 
    ? Math.round(recentResumes.reduce((acc: number, r: any) => acc + r.ats_score, 0) / recentResumes.length) 
    : 0;

  return (
    <DashboardClient 
      user={user}
      profile={profile}
      recentResumes={recentResumes}
      stats={{ 
        totalScans: totalScansCount, // Now accurate, not just limited to 5
        avgScore 
      }}
    />
  );
}