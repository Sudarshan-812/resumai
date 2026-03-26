module.exports = [
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// lib/supabase/server.ts
__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
async function createClient() {
    // Required in Next.js 15 (cookies() returns a Promise)
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://hghmtqszeqcbbplvopfa.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnaG10cXN6ZXFjYmJwbHZvcGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NDc4NjYsImV4cCI6MjA4MDMyMzg2Nn0.Xz8Frt3qnqyJew7x3cTJVc6g1pNnvFZ2NUBoGGgA6ds"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>{
                        cookieStore.set(name, value, options);
                    });
                } catch  {
                // Happens when called inside a Server Component
                // Safe to ignore because middleware refreshes sessions
                }
            }
        }
    });
}
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/lib/gemini-generator.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateContent",
    ()=>generateContent,
    "generateCoverLetter",
    ()=>generateCoverLetter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-rsc] (ecmascript)");
;
const genAI = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY);
async function generateContent(prompt) {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash"
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to generate content from AI");
    }
}
async function generateCoverLetter(resumeText, jobDescription) {
    const prompt = `
    Based on this resume: ${resumeText}
    And this job description: ${jobDescription}
    Write a professional cover letter.
  `;
    return generateContent(prompt);
}
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/ai-features.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"7008d8d2d20765c715e577c7016f01574615d8e21a":"generateCareerDoc"},"",""] */ __turbopack_context__.s([
    "generateCareerDoc",
    ()=>generateCareerDoc
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$gemini$2d$generator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/lib/gemini-generator.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function generateCareerDoc(resumeId, jobDescription, type) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Server Error: API Key is missing.");
    }
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");
    const { data: resume, error } = await supabase.from('resumes').select('*').eq('id', resumeId).single();
    if (error || !resume) throw new Error("Resume not found");
    let context = "";
    if (resume.content) {
        context = resume.content;
    } else if (resume.original_analysis) {
        const analysis = typeof resume.original_analysis === 'string' ? JSON.parse(resume.original_analysis) : resume.original_analysis;
        context = JSON.stringify(analysis);
    } else {
        context = "User resume data.";
    }
    const prompt = type === 'cover_letter' ? `You are an expert career coach. Write a professional cover letter for the following Job Description:
"${jobDescription}"

Using the candidate's background details here:
${context}

Keep it concise, professional, and highlight matching skills.
Output ONLY the cover letter text.` : `You are an expert technical recruiter. Based on this Job Description:
"${jobDescription}"

And this candidate's resume:
${context}

Generate 5 likely interview questions and brief suggested answers.
Return the output in this specific JSON format (do not use markdown code blocks):
{
  "questions": [
    { "question": "...", "answer": "..." }
  ]
}`;
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$gemini$2d$generator$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateContent"])(prompt);
    if (type === 'interview_prep') {
        const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(cleaned);
        } catch  {
            throw new Error("Failed to parse AI response as JSON.");
        }
    }
    return result;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    generateCareerDoc
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(generateCareerDoc, "7008d8d2d20765c715e577c7016f01574615d8e21a", null);
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/dashboard/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/ai-features.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$actions$2f$ai$2d$features$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/ai-features.ts [app-rsc] (ecmascript)");
;
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/dashboard/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/ai-features.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "7008d8d2d20765c715e577c7016f01574615d8e21a",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$actions$2f$ai$2d$features$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["generateCareerDoc"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$actions$2f$ai$2d$features$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/dashboard/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/ai-features.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$actions$2f$ai$2d$features$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/ai-features.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=OneDrive_Desktop_AI%20RESUME%20PROJ_resumai_367fddc8._.js.map