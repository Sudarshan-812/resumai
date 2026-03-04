"use server";

// IMPORTANT: Adjust this import to point to where your Supabase server client is initialized.
// If you followed the official Supabase Next.js guide, it usually looks like this:
import { createClient } from "@/app/lib/supabase/server"; // Adjust the path as needed

interface SaveScanPayload {
  resumeText: string;
  jobDescription: string;
  atsScore: number;
  calculatedYoe: number;
  analysisJson: any; // The raw JSON returned from Gemini
}

export async function saveScanRecord(payload: SaveScanPayload) {
  try {
    const supabase = await createClient();
    
    // 1. Get the current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Unauthorized: You must be logged in to save scans.");
    }

    // 2. Insert the data into our new table
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
      console.error("Supabase Insert Error:", insertError);
      throw new Error("Failed to save scan to the database.");
    }

    // 3. Return the new row ID so the frontend can redirect or update state
    return { success: true, scanId: data.id };

  } catch (error: any) {
    console.error("Database Action Error:", error);
    return { success: false, error: error.message };
  }
}