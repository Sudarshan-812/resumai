import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client"; // Importing the new client file

export default async function DashboardPage() {
  const supabase = await createClient();
  
  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  // 2. Fetch Data (Resumes)
  const { data: rawResumes } = await supabase
    .from("resumes")
    .select("id, file_name, created_at, analyses(ats_score)") 
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // 3. Fetch Data (Profile)
  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, full_name")
    .eq("id", user.id)
    .single();

  // 4. Transform Data
  // Flatten the array to make it easier for the client to use
  const recentResumes = (rawResumes || []).map((r: any) => ({
    ...r,
    ats_score: r.analyses?.[0]?.ats_score || 0
  }));

  // Calculate Stats
  const totalScans = recentResumes.length; 
  const avgScore = totalScans > 0 
    ? Math.round(recentResumes.reduce((acc: number, r: any) => acc + r.ats_score, 0) / totalScans) 
    : 0;

  // 5. Render the Client Component
  return (
    <DashboardClient 
      user={user}
      profile={profile}
      recentResumes={recentResumes}
      stats={{ totalScans, avgScore }}
    />
  );
}