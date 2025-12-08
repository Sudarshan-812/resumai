import { createClient } from "./supabase/server";

// 1. Fetch ALL resumes with Deduplication
export async function getResumes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return [];

  const { data, error } = await supabase
    .from('resumes')
    .select(`
      id,
      file_name,
      created_at,
      analyses (
        ats_score,
        summary_feedback
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Fetch Error:", error);
    return [];
  }

  // Deduplicate by file_name (Keep only the most recent one)
  const uniqueResumesMap = new Map();
  
  data.forEach((item) => {
    if (!uniqueResumesMap.has(item.file_name)) {
      uniqueResumesMap.set(item.file_name, item);
    }
  });

  // Convert back to array
  const uniqueList = Array.from(uniqueResumesMap.values());

  return uniqueList;
}

// 2. Fetch ONE resume by ID
export async function getResumeById(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('resumes')
    .select(`
      *,
      analyses (*)
    `)
    .eq('id', id)
    .eq('user_id', user.id) // Security: Ensure they own it
    .single();

  if (error) {
    console.error("Single Fetch Error:", error);
    return null;
  }
  
  return data;
}