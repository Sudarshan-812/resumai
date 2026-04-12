import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@/app/lib/supabase/server";

export const maxDuration = 60;

const LATEX_PREAMBLE = `\\documentclass[letterpaper,10.5pt]{article}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[colorlinks=true, urlcolor=blue]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{xcolor}
\\usepackage[T1]{fontenc}
\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.55in}
\\addtolength{\\evensidemargin}{-0.55in}
\\addtolength{\\textwidth}{1.1in}
\\addtolength{\\topmargin}{-0.65in}
\\addtolength{\\textheight}{1.3in}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}
\\titleformat{\\section}{\\vspace{-5pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-4pt}]
\\newcommand{\\resumeItem}[1]{\\item \\small{#1 \\vspace{-1pt}}}
\\newcommand{\\resumeSubheading}[4]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{\\small #3} & \\textit{\\small #4}
  \\end{tabular*}\\vspace{-5pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & {\\small #2}
  \\end{tabular*}\\vspace{-5pt}
}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in,label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}[leftmargin=0.15in, itemsep=0pt, topsep=2pt, label=\\textbullet]}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-4pt}}
\\newcommand{\\projectLink}[2]{\\href{#2}{\\textcolor{blue}{#1}}}`;

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response("Unauthorized", { status: 401 });

    const { resumeId } = await req.json();
    if (!resumeId) return Response.json({ error: "Missing resumeId" }, { status: 400 });

    const [resumeRes, analysisRes] = await Promise.all([
      supabase.from("resumes").select("file_name, content").eq("id", resumeId).eq("user_id", user.id).single(),
      supabase.from("analyses").select("job_description").eq("resume_id", resumeId).eq("user_id", user.id).single(),
    ]);

    if (!resumeRes.data?.content) {
      return Response.json({ error: "Resume content not found" }, { status: 404 });
    }

    const resumeText = resumeRes.data.content;

    const { text: latex } = await generateText({
      model: google("gemini-3.1-flash-lite-preview"),
      prompt: `You are a LaTeX resume formatter. Convert the resume text below into a complete, professional LaTeX document.

USE EXACTLY THIS PREAMBLE (copy verbatim):
${LATEX_PREAMBLE}

\\begin{document}

[YOUR CONTENT HERE]

\\end{document}

RESUME TEXT TO CONVERT:
---
${resumeText.slice(0, 8000)}
---

STRICT REQUIREMENTS:
1. Start with \\documentclass exactly as shown in the preamble above
2. Use ONLY these custom commands: \\resumeItem, \\resumeSubheading, \\resumeProjectHeading, \\resumeSubHeadingListStart/End, \\resumeItemListStart/End, \\projectLink
3. Use \\section{} for main sections: Professional Summary, Technical Skills, Experience (or Projects), Education, Achievements
4. For skills: use \\section{Technical Skills} then \\small{\\textbf{Category:} items \\\\}
5. For experience/projects: use \\resumeSubHeadingListStart with \\resumeSubheading or \\resumeProjectHeading followed by \\resumeItemListStart
6. Header: \\begin{center} with {\\Huge \\bfseries Name} and contact info using $|$ separators
7. Return ONLY the complete LaTeX document — no markdown, no explanation, no code fences
8. Make it look professional and well-formatted`,
    });

    // Clean up response (remove any markdown fences if AI added them)
    const cleaned = latex
      .replace(/^```latex\n?/i, "")
      .replace(/^```\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    return Response.json({ latex: cleaned });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate LaTeX";
    return Response.json({ error: msg }, { status: 500 });
  }
}
