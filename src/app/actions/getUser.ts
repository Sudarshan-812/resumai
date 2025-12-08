// app/actions/getUser.ts
"use server";

import { createClient } from "@/app/lib/supabase/server";

export async function getUser() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Supabase getUser error:", error);
    return null;
  }

  return user;
}
