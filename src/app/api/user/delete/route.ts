import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

// GDPR / right-to-erasure: permanently delete the authenticated user's data
export async function DELETE() {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Delete in FK-safe order: chunks → analyses → resumes → profile → auth user
    await supabase.from("resume_chunks").delete().eq("user_id", user.id);
    await supabase.from("analyses").delete().eq("user_id", user.id);
    await supabase.from("resumes").delete().eq("user_id", user.id);
    await supabase.from("profiles").delete().eq("id", user.id);

    // Sign the user out of all sessions before deleting the auth record
    await supabase.auth.signOut();

    // Requires service-role key — call admin API to delete the auth.users row
    const adminUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${user.id}`;
    await fetch(adminUrl, {
      method: "DELETE",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Deletion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
