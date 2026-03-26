module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/api/analyze/ai-llm/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/app/api/analyze/ai-llm/route.ts
__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/server.js [app-route] (ecmascript)");
;
async function callOpenAI(prompt, key) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: 300
        })
    });
    const text = await res.text();
    try {
        const json = JSON.parse(text);
        const content = json?.choices?.[0]?.message?.content ?? text;
        return {
            ok: res.ok,
            status: res.status,
            provider: "openai",
            data: json,
            text: content
        };
    } catch  {
        return {
            ok: res.ok,
            status: res.status,
            provider: "openai",
            data: text,
            text
        };
    }
}
async function callGemini(prompt, key) {
    // Use Google Generative Language REST endpoint with API key query parameter
    // NOTE: ensure Generative Language API is enabled and key has billing/permissions
    const endpoint = `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generate?key=${encodeURIComponent(key)}`;
    const body = {
        // simple text prompt form — keeps compatibility across clients
        prompt: {
            text: prompt
        },
        maxOutputTokens: 300
    };
    const res = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const json = await res.json().catch(()=>null);
    // Gemini/Generative Language returns candidates[0].output or "candidates"
    const textOutput = json?.candidates?.[0]?.output || json?.candidates?.[0]?.content?.[0]?.text || JSON.stringify(json);
    return {
        ok: res.ok,
        status: res.status,
        provider: "gemini",
        data: json,
        text: textOutput
    };
}
async function GET() {
    try {
        const OPENAI_KEY = process.env.OPENAI_API_KEY;
        const GEMINI_KEY = process.env.GEMINI_API_KEY;
        if (!OPENAI_KEY && !GEMINI_KEY) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                ok: false,
                error: "Missing OPENAI_API_KEY or GEMINI_API_KEY"
            }, {
                status: 500
            });
        }
        const prompt = `Server LLM test — say "hello" and include timestamp: ${new Date().toISOString()}`;
        if (OPENAI_KEY) {
            const result = await callOpenAI(prompt, OPENAI_KEY);
            return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result, {
                status: result.status ?? 200
            });
        } else {
            // Use Gemini
            const result = await callGemini(prompt, GEMINI_KEY);
            return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result, {
                status: result.status ?? 200
            });
        }
    } catch (err) {
        console.error("AI LLM route error:", err);
        return __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            error: String(err)
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a39e863d._.js.map