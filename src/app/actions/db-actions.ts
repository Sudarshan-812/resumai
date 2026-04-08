"use server";

import { createClient } from "@/app/lib/supabase/server";

interface SaveScanPayload {
  resumeText: string;
  jobDescription: string;
  atsScore: number;
  calculatedYoe: number;
  analysisJson: any;
}

export async function saveScanRecord(payload: SaveScanPayload) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized: You must be logged in to save scans.");
    }

    const { data, error: insertError } = await supabase
      .from('scans')
      .insert([
        {
          user_id: user.id,
          resume_text: payload.resumeText,
          job_description: payload.jobDescription,
          ats_score: payload.atsScore,
          calculated_yoe: payload.calculatedYoe,
          analysis_json: payload.analysisJson,
        }
      ])
      .select()
      .single();

    if (insertError) {
      throw new Error("Failed to save scan to the database.");
    }

    return { success: true, scanId: data.id };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
