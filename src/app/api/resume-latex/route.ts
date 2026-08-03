import { groq } from "@ai-sdk/groq";
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
    const jobDescription = analysisRes.data?.job_description as string | undefined;

    const { text: latex } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      temperature: 0.2,
      maxOutputTokens: 4096,
      prompt: `You are a meticulous LaTeX resume formatter. Convert the resume text below into a complete, professional, ATS-safe LaTeX document.

USE EXACTLY THIS PREAMBLE (copy verbatim):
${LATEX_PREAMBLE}

\\begin{document}

[YOUR CONTENT HERE]

\\end{document}

RESUME TEXT TO CONVERT (this is the ONLY source of truth for facts):
---
${resumeText.slice(0, 8000)}
---
${jobDescription ? `
TARGET JOB DESCRIPTION (use ONLY to decide which of the candidate's real experiences/skills to emphasize and reorder toward the top - never to add content):
---
${jobDescription.slice(0, 2000)}
---
` : ""}

ANTI-HALLUCINATION RULES (violating these is a critical failure):
- Every company, title, date, degree, metric, and bullet point must come directly from RESUME TEXT above. Do NOT invent, embellish, round, or "improve" any fact, number, or achievement that isn't already there.
- If a field is missing from the source (e.g. no phone number, no GPA), omit that field entirely - never insert a placeholder like "[Your Phone]" or invented content.
- You MAY reorder sections/bullets and tighten wording for clarity and ATS keyword alignment with the job description, but the underlying facts must be unchanged.
- Do not add a professional summary paragraph unless the source resume already contains one to draw from.

LATEX SPECIAL-CHARACTER ESCAPING (the document must compile - resumes commonly contain these raw characters, escape every occurrence):
  % -> \\%   |   $ -> \\$   |   & -> \\&   |   # -> \\#   |   _ -> \\_   |   ~ -> \\textasciitilde{}   |   ^ -> \\textasciicircum{}
  Do NOT escape characters that are already part of a custom command (e.g. the literal \\& inside \\resumeSubheading's own arguments is fine as \\& once escaped).

STRUCTURE REQUIREMENTS:
1. Start with \\documentclass exactly as shown in the preamble above
2. Use ONLY these custom commands: \\resumeItem, \\resumeSubheading, \\resumeProjectHeading, \\resumeSubHeadingListStart/End, \\resumeItemListStart/End, \\projectLink
3. Use \\section{} for main sections that actually have content in the source: Professional Summary, Technical Skills, Experience (or Projects), Education, Achievements. Skip any section the source resume doesn't support.
4. For skills: use \\section{Technical Skills} then \\small{\\textbf{Category:} items \\\\} - group real skills from the source into sensible categories (Languages, Frameworks, Tools, etc.)
5. For experience/projects: use \\resumeSubHeadingListStart with \\resumeSubheading or \\resumeProjectHeading followed by \\resumeItemListStart. Keep 3-5 bullets per role - trim to the strongest ones if the source has more, but never merge two different roles' bullets together.
6. Header: \\begin{center} with {\\Huge \\bfseries Name} and contact info using $|$ separators - only include contact fields present in the source.
7. Target a single page at 10.5pt - if the source is long, prioritize the most recent/relevant experience and trim older or weaker bullets rather than shrinking margins.
8. Return ONLY the complete LaTeX document - no markdown, no explanation, no code fences`,
    });

    // Clean up response (remove any markdown fences if AI added them)
    const cleaned = latex
      .replace(/^```latex\n?/i, "")
      .replace(/^```\n?/i, "")
      .replace(/\n?```$/i, "")
      .trim();

    const beginCount = (cleaned.match(/\\begin\{document\}/g) ?? []).length;
    const endCount = (cleaned.match(/\\end\{document\}/g) ?? []).length;

    if (
      !cleaned.includes("\\documentclass") ||
      beginCount !== 1 ||
      endCount !== 1 ||
      cleaned.includes("[YOUR CONTENT HERE]")
    ) {
      return Response.json({ error: "AI returned invalid LaTeX output. Please try again." }, { status: 500 });
    }

    return Response.json({ latex: cleaned });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to generate LaTeX";
    return Response.json({ error: msg }, { status: 500 });
  }
}
