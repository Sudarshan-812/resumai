import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

const PAGE_SIZE = 20;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to   = from + PAGE_SIZE - 1;

  const { data: resumes, count } = await supabase
    .from("resumes")
    .select("id, file_name, created_at, analyses(ats_score)", { count: "exact" })
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  interface RawResume {
    id: string;
    file_name: string;
    created_at: string;
    analyses: Array<{ ats_score?: number | null }> | null;
  }

  const formatted = (resumes as RawResume[] || []).map((r) => ({
    ...r,
    ats_score: r.analyses?.[0]?.ats_score ?? 0,
  }));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <HistoryClient
      resumes={formatted}
      totalCount={count ?? 0}
      page={page}
      totalPages={totalPages}
    />
  );
}
