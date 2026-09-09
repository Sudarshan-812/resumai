import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { createClient } from "@/app/lib/supabase/server";
export const maxDuration = 60;

const LATEX_PREAMBLE = `\\documentclass[letterpaper,11pt]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage{tabularx}
\\usepackage{xcolor}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-0.6in}
\\addtolength{\\textheight}{1.1in}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}
{\\vspace{-6pt}\\scshape\\raggedright\\large}
{}{0em}{}
[\\color{black}\\titlerule \\vspace{-5pt}]

\\newcommand{\\resumeItem}[1]{
  \\item \\small{#1}
}

\\newcommand{\\resumeSubheading}[4]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{\\small #3} & \\textit{\\small #4}
  \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & \\textit{\\small #2}
  \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeSubHeadingListStart}{
  \\begin{itemize}[leftmargin=0.15in,label={}]
}
\\newcommand{\\resumeSubHeadingListEnd}{
  \\end{itemize}
}
\\newcommand{\\resumeItemListStart}{
  \\begin{itemize}[leftmargin=0.15in]
}
\\newcommand{\\resumeItemListEnd}{
  \\end{itemize}\\vspace{-5pt}
}

\\newcommand{\\projectLink}[2]{
  \\href{#2}{\\textcolor{blue}{#1}}
}`;

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
      maxOutputTokens: 8192,
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

STRUCTURE REQUIREMENTS (match this template exactly):
1. Start with \\documentclass exactly as shown in the preamble above, then \\begin{document} ... \\end{document}.
2. Use ONLY these custom commands: \\resumeItem, \\resumeSubheading, \\resumeProjectHeading, \\resumeSubHeadingListStart/End, \\resumeItemListStart/End, \\projectLink.
3. Header: \\begin{center} ... \\end{center} with {\\Huge \\scshape Name} on the first line, then \\small and one contact line joining present fields with $|$ separators (phone, \\href{mailto:...}{email}, \\href{...}{LinkedIn}, \\href{...}{GitHub}, \\href{...}{Portfolio}), then an optional location / availability line. Only include fields that exist in the source.
4. \\section{Professional Summary}: only if the source has summary/objective content - render it as a bare \\small{ ... } paragraph (NOT a list), 2-4 sentences drawn from the source.
5. \\section{Technical Skills}: \\small{ \\textbf{Category:} items \\\\ ... } - group the source's real skills into sensible categories (Frontend, Backend, Tools, etc.), one \\textbf{...}: line each, separated by \\\\.
6. \\section{Experience} and/or \\section{Projects}: wrap in \\resumeSubHeadingListStart ... \\resumeSubHeadingListEnd. Use \\resumeSubheading{Org}{Date}{Role}{Location} for jobs, \\resumeProjectHeading{Name}{Date \\quad \\projectLink{Live}{url}} for projects. Each entry is followed by \\resumeItemListStart ... \\resumeItemListEnd with 3-5 \\resumeItem{...} bullets. Never merge two entries' bullets.
7. \\section{Key Achievements} / \\section{Education}: for a plain bullet list use \\resumeItemListStart ... \\resumeItemListEnd directly; for degree entries use \\resumeSubHeadingListStart + \\resumeSubheading{Degree}{}{Institution}{Location} + \\resumeSubHeadingListEnd.
8. Skip any section the source resume doesn't support. Target a single page at 11pt - if the source is long, prioritise recent/relevant experience and trim weaker bullets rather than shrinking margins.
9. Return ONLY the complete LaTeX document - no markdown, no explanation, no code fences.`,
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
