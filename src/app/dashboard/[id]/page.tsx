import { createClient } from "@/app/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import ClientReport from "../[id]/ClientReport";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("resumes").select("file_name").eq("id", id).single();
  return {
    title: data?.file_name ? `${data.file_name} Analysis` : "Resume Report",
  };
}

export default async function ResumeReportPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return redirect("/login");

  const [resumeRes, analysisRes] = await Promise.all([
    supabase.from("resumes").select("*").eq("id", id).eq("user_id", user.id).single(),
    supabase.from("analyses").select("*").eq("resume_id", id).eq("user_id", user.id).single(),
  ]);

  if (!resumeRes.data || !analysisRes.data) return notFound();

  return (
    <ClientReport
      resume={resumeRes.data}
      analysis={analysisRes.data}
    />
  );
}