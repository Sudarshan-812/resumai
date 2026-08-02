import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";

// Issue 13: Proper types instead of `any`
interface ResumeRow {
  id: string;
  file_name: string;
  created_at: string;
  analyses: Array<{ ats_score: number | null }> | null;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const [resumesResponse, profileResponse] = await Promise.all([
    supabase
      .from("resumes")
      .select("id, file_name, created_at, analyses(ats_score)", { count: "exact" })
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(5),

    supabase
      .from("profiles")
      .select("credits, full_name")
      .eq("id", user.id)
      .single(),
  ]);

  const rawResumes = (resumesResponse.data ?? []) as ResumeRow[];
  const profile = profileResponse.data;
  const totalScansCount = resumesResponse.count ?? 0;

  const recentResumes = rawResumes.map((r) => ({
    ...r,
    ats_score: r.analyses?.[0]?.ats_score ?? 0,
  }));

  const avgScore = recentResumes.length > 0
    ? Math.round(recentResumes.reduce((acc, r) => acc + (r.ats_score ?? 0), 0) / recentResumes.length)
    : 0;

  return (
    <DashboardClient
      user={user}
      profile={profile}
      recentResumes={recentResumes}
      stats={{
        totalScans: totalScansCount,
        avgScore
      }}
    />
  );
}
