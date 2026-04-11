/**
 * Validates that all required environment variables are present at startup.
 * Import this in server-side entry points (layout.tsx, API routes, server actions).
 */

const required = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "GEMINI_API_KEY",
  "NEXT_PUBLIC_RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
] as const;

function validateEnv() {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  - ${k}`).join("\n")}\n\nAdd them to your .env.local file.`
    );
  }
}

// Only validate on the server (not in browser bundles)
if (typeof window === "undefined") {
  validateEnv();
}

export {};
