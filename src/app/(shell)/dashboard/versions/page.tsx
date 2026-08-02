import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import VersionsClient from "./versions-client";

export default async function VersionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, file_name, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <VersionsClient resumes={resumes || []} />;
}
