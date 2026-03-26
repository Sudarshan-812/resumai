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
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"401368fc763fdb382137e69f575a67809a72c5552c":"$$RSC_SERVER_ACTION_1","40ff7d32a973218087f4f8e8b7b402be654e6866c4":"$$RSC_SERVER_ACTION_0"},"",""] */ __turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "$$RSC_SERVER_ACTION_1",
    ()=>$$RSC_SERVER_ACTION_1,
    "default",
    ()=>Login
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/headers.js [app-rsc] (ecmascript)");
// 👇 CHECK THIS PATH: If you moved 'lib' to 'src/lib', change this to "@/lib/supabase/server"
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
;
;
;
;
;
const $$RSC_SERVER_ACTION_0 = async function signIn(formData) {
    const email = formData.get("email") || "";
    const password = formData.get("password") || "";
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Attempt Login
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    // 2. Handle Error
    if (error) {
        console.error("SignIn error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/login?message=${encodeURIComponent(error.message ?? "Sign in failed")}`);
    }
    // 3. Success Redirect (MUST BE OUTSIDE try/catch)
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "40ff7d32a973218087f4f8e8b7b402be654e6866c4", null);
const $$RSC_SERVER_ACTION_1 = async function signUp(formData) {
    // Fix headers awaiting for Next.js 15
    const hdr = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
    const origin = hdr.get("origin") ?? `http://localhost:${process.env.PORT ?? 3000}`;
    const email = formData.get("email") || "";
    const password = formData.get("password") || "";
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    // 1. Attempt Sign Up
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${origin}/auth/callback`
        }
    });
    // 2. Handle Error
    if (error) {
        console.error("SignUp error", error);
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/login?message=${encodeURIComponent(error.message ?? "Sign up failed")}`);
    }
    // 3. Success Redirect
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login?message=Check email to continue sign in process");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_1, "401368fc763fdb382137e69f575a67809a72c5552c", null);
async function Login({ searchParams }) {
    const { message } = await searchParams;
    const signIn = $$RSC_SERVER_ACTION_0;
    const signUp = $$RSC_SERVER_ACTION_1;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            className: "animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground",
            action: signIn,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "text-md",
                    htmlFor: "email",
                    children: "Email"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    className: "rounded-md px-4 py-2 bg-inherit border mb-6",
                    name: "email",
                    placeholder: "you@example.com",
                    required: true
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                    className: "text-md",
                    htmlFor: "password",
                    children: "Password"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
                    lineNumber: 79,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    className: "rounded-md px-4 py-2 bg-inherit border mb-6",
                    type: "password",
                    name: "password",
                    placeholder: "••••••••",
                    required: true
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
                    lineNumber: 80,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "bg-green-700 rounded-md px-4 py-2 text-foreground mb-2 text-white",
                    children: "Sign In"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
                    lineNumber: 87,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    formAction: signUp,
                    className: "border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2",
                    children: "Sign Up"
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
                    lineNumber: 90,
                    columnNumber: 9
                }, this),
                message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-4 p-4 bg-foreground/10 text-foreground text-center",
                    children: message
                }, void 0, false, {
                    fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
                    lineNumber: 98,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
            lineNumber: 68,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$login$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx [app-rsc] (ecmascript)");
;
;
}),
"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => \"[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "401368fc763fdb382137e69f575a67809a72c5552c",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$login$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_1"],
    "40ff7d32a973218087f4f8e8b7b402be654e6866c4",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$login$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f2e$next$2d$internal$2f$server$2f$app$2f$login$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$login$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/.next-internal/server/app/login/page/actions.js { ACTIONS_MODULE0 => "[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$OneDrive$2f$Desktop$2f$AI__RESUME__PROJ$2f$resumai$2f$src$2f$app$2f$login$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/OneDrive/Desktop/AI RESUME PROJ/resumai/src/app/login/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=OneDrive_Desktop_AI%20RESUME%20PROJ_resumai_bbad9043._.js.map