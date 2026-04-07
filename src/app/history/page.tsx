import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, file_name, created_at, analyses(ats_score)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const formatted = (resumes || []).map((r: any) => ({
    ...r,
    ats_score: r.analyses?.[0]?.ats_score ?? 0,
  }));

  return <HistoryClient resumes={formatted} />;
}
