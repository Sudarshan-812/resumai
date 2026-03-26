// src/app/api/analyze/route.ts
import { NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { analyzeResume } from "@/app/lib/gemini";
import { createClient } from "@/app/lib/supabase/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Improved text extraction for tricky PDFs
// @ts-expect-error - pdf-parse types are incomplete
const render_page = (pageData) => {
  return pageData
    .getTextContent()
    // @ts-expect-error - pdf-parse types are incomplete
    .then((textContent) => {
      let lastY: number | null = null;
      let text = "";
      for (const item of textContent.items) {
        const y = item.transform[5];
        if (lastY !== y && lastY !== null) text += "\n";
        lastY = y;
        text += item.str;
      }
      return text;
    })
    .catch(() => "");
};

export const POST = async (req: Request) => {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    // 🚨 FIX: Extract jobDescription from the incoming form data
    const jobDescription = (formData.get("jobDescription") as string) || "";

    // ——— File Validation ———
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file uploaded" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { success: false, message: "File is empty" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, message: "File too large — max 10MB" },
        { status: 413 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { success: false, message: "Only PDF files allowed" },
        { status: 400 }
      );
    }

    // ——— Extract Text ———
    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText: string;

    try {
      const data = await pdfParse(buffer, { pagerender: render_page, max: 0 });
      extractedText = data.text.trim();
    } catch (error: unknown) {
      const pdfError = error as Error;
      console.error("PDF parsing failed:", pdfError);

      const msg = pdfError.message?.toLowerCase() || "";
      if (msg.includes("password") || msg.includes("encrypted")) {
        return NextResponse.json(
          { success: false, message: "PDF is password-protected", hint: "Remove password and try again" },
          { status: 422 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "No text found in PDF",
          hint: "This is usually a scanned/image-only resume. Export as text PDF from Word/Google Docs.",
        },
        { status: 422 }
      );
    }

    if (!extractedText || extractedText.length < 50) {
      return NextResponse.json(
        {
          success: false,
          message: "Very little text found",
          hint: "Make sure your resume contains selectable text, not just images.",
        },
        { status: 422 }
      );
    }

    // ——— AI Analysis ———
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let analysis: any;
    try {
      // 🚨 FIX: Pass both the extractedText AND the jobDescription to the AI
      analysis = await analyzeResume(extractedText, jobDescription);
    } catch (error: unknown) {
      const aiError = error as Error;
      console.error("AI analysis failed:", aiError);
      return NextResponse.json(
        { success: false, message: "AI analysis failed", error: aiError.message },
        { status: 500 }
      );
    }

    if (!analysis || typeof analysis !== "object") {
      return NextResponse.json(
        { success: false, message: "Invalid AI response" },
        { status: 500 }
      );
    }

    // ——— SAVE TO SUPABASE (Now with clear logging) ———
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("Guest upload → skipping DB save (normal)");
      } else {
        const { error: insertError } = await supabase.from("resumes").insert({
          user_id: user.id,
          file_name: file.name,
          content: extractedText.slice(0, 150_000),
          analyzed_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("Supabase insert failed:", insertError.message);
          console.error("Details:", insertError);
        } else {
          console.log("Resume saved successfully for user:", user.id, "→", file.name);
        }
      }
    } catch (error: unknown) {
      console.error("Database error:", error);
    }

    // ——— SUCCESS ———
    return NextResponse.json(
      { success: true, data: analysis },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Unhandled error in /api/analyze:", err);
    return NextResponse.json(
      { success: false, message: "Server error", error: err.message },
      { status: 500 }
    );
  }
};