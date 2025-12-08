// app/actions/getUserResumes.ts
"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function getUserResumes() {
  const supabase = await createClient();

  // Get the current logged-in user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching resumes:", error);
    return [];
  }

  return data ?? [];
}
