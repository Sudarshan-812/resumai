import { createClient } from "./supabase/server";

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
    return [];
  }

  const uniqueResumesMap = new Map();

  data.forEach((item) => {
    if (!uniqueResumesMap.has(item.file_name)) {
      uniqueResumesMap.set(item.file_name, item);
    }
  });

  return Array.from(uniqueResumesMap.values());
}

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
    .eq('user_id', user.id)
    .single();

  if (error) {
    return null;
  }

  return data;
}
