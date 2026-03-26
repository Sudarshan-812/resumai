module.exports = [
"[externals]/pdf-parse [external] (pdf-parse, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("pdf-parse", () => require("pdf-parse"));

module.exports = mod;
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/lib/gemini.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/lib/gemini.ts
__turbopack_context__.s([
    "analyzeResume",
    ()=>analyzeResume
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@google/generative-ai/dist/index.mjs [app-rsc] (ecmascript)");
;
if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
}
const genAi = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$google$2f$generative$2d$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["GoogleGenerativeAI"](process.env.GEMINI_API_KEY);
async function analyzeResume(resumeText) {
    const model = genAi.getGenerativeModel({
        model: "gemini-2.5-pro",
        generationConfig: {
            responseMimeType: "application/json"
        }
    });
    const prompt = `
You are an expert ATS & Resume Coach.
Analyze the following resume text and output strictly JSON:

RESUME TEXT:
"${resumeText}"

Return:
{
  "ats_score": number,
  "summary_feedback": "string",
  "skills_found": ["skill1","skill2"],
  "missing_keywords": ["keyword1","keyword2"],
  "formatting_issues": ["issue1","issue2"]
}
`;
    const result = await model.generateContent(prompt);
    const response = result.response;
    // IMPORTANT: await the text
    const raw = await response.text();
    console.log("Gemini raw response (server):", raw?.slice ? raw.slice(0, 2000) : raw); // log first 2k chars
    if (!raw || raw.trim().length === 0) {
        const err = new Error("Empty response from Gemini");
        err.raw = raw;
        throw err;
    }
    // Try parse, attach raw on failure
    try {
        return JSON.parse(raw);
    } catch (parseErr) {
        parseErr.raw = raw;
        console.error("Failed to JSON.parse Gemini response:", parseErr);
        throw parseErr;
    }
}
}),
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
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/upload-resume.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// app/actions/upload-resume.ts
/* __next_internal_action_entry_do_not_use__ [{"4021acecb59964dc51d038ca4a17689f6b2948a317":"processResume"},"",""] */ __turbopack_context__.s([
    "processResume",
    ()=>processResume
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$parse__$5b$external$5d$__$28$pdf$2d$parse$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/pdf-parse [external] (pdf-parse, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$gemini$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/lib/gemini.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
const render_page = (pageData)=>{
    return pageData.getTextContent().then((textContent)=>{
        let lastY = null;
        let text = "";
        for (const item of textContent.items){
            const y = item.transform[5];
            if (lastY !== y && lastY !== null) text += "\n";
            lastY = y;
            text += item.str;
        }
        return text;
    }).catch(()=>"");
};
async function processResume(formData) {
    const file = formData.get('file');
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Must be logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return {
            success: false,
            message: "Please log in to analyze resumes"
        };
    }
    if (!file || file.size === 0) {
        return {
            success: false,
            message: "No valid file uploaded"
        };
    }
    try {
        // 2. Extract text from PDF
        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$pdf$2d$parse__$5b$external$5d$__$28$pdf$2d$parse$2c$__cjs$29$__["default"])(buffer, {
            pagerender: render_page,
            max: 0
        });
        const text = data.text.trim();
        if (!text || text.length < 50) {
            return {
                success: false,
                message: "No readable text found in PDF",
                hint: "This is usually a scanned/image resume. Export as text PDF."
            };
        }
        // 3. AI Analysis
        const analysis = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$gemini$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["analyzeResume"])(text);
        // 4. Save Resume
        const { data: resume, error: resumeError } = await supabase.from('resumes').insert({
            user_id: user.id,
            file_name: file.name,
            content: text.slice(0, 150_000)
        }).select().single();
        if (resumeError) throw resumeError;
        // 5. Save Analysis
        const { error: analysisError } = await supabase.from('analyses').insert({
            resume_id: resume.id,
            user_id: user.id,
            ats_score: analysis.ats_score,
            summary_feedback: analysis.summary_feedback,
            skills_found: analysis.skills_found,
            missing_keywords: analysis.missing_keywords,
            formatting_issues: analysis.formatting_issues || []
        });
        if (analysisError) throw analysisError;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])('/dashboard');
        return {
            success: true,
            data: analysis,
            id: resume.id
        };
    } catch (error) {
        console.error("Resume processing failed:", error);
        return {
            success: false,
            message: error.message || "Analysis failed"
        };
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    processResume
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(processResume, "4021acecb59964dc51d038ca4a17689f6b2948a317", null);
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/upload-resume.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$actions$2f$upload$2d$resume$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/upload-resume.ts [app-rsc] (ecmascript)");
;
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/upload-resume.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4021acecb59964dc51d038ca4a17689f6b2948a317",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$actions$2f$upload$2d$resume$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["processResume"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f2e$next$2d$internal$2f$server$2f$app$2f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$actions$2f$upload$2d$resume$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/dashboard/page/actions.js { ACTIONS_MODULE0 => "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/upload-resume.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$actions$2f$upload$2d$resume$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/actions/upload-resume.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__843b8349._.js.map