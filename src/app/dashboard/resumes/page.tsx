import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import ResumesClient from "./resumes-client";

export default async function ResumesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits, full_name")
    .eq("id", user.id)
    .single();

  return <ResumesClient user={user} profile={profile} />;
}