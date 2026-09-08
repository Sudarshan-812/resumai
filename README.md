# Viva

**AI resume scoring + spoken AI mock interviews.**

Viva scores a resume against a specific job description, shows the exact keyword and
formatting gaps that make an Applicant Tracking System (ATS) reject it, and then lets
the candidate rehearse a real, spoken mock interview with an AI interviewer that has
read both their resume and the target job.

Built for the US job market.

🔗 **Live application:** https://column8.io/

---

## Architecture & tech stack

* **Framework:** Next.js (App Router) + React 19, TypeScript
* **Styling:** Tailwind CSS v4
* **Auth & data:** Supabase (Postgres + Auth)
* **Resume analysis:** Google Gemini
* **Text interview Q&A + feedback:** Groq (Llama 3.3)
* **Voice interview:** LiveKit WebRTC room + a Python worker (`python/agent.py`)
  running Deepgram STT, Groq Llama 3.3, Deepgram Aura-2 TTS, and Silero VAD
* **Payments:** one-time credit packs
* **Rate limiting:** Upstash Redis
* **Hosting:** Vercel

## Core features

* **ATS Match Score** - weighted rubric (keyword match, experience alignment,
  demonstrated skills, ATS-safe formatting) against any pasted job description.
* **Keyword Gap Analysis** - what the resume matches and what it is missing.
* **Bullet Rewriter** - rewrites the weakest bullet points with action verbs and
  quantified impact.
* **Voice Mock Interview** - real-time spoken interview generated from the
  candidate's resume and target job, with a post-session summary.
* **Text Mock Interview** - typed Q&A with per-answer scoring and coaching.
* **Cover Letter Generator** - role-specific, mapped to the job description.
* **Version history** - track score changes across resume iterations.

## FinOps & abuse protection

Voice interviews are the most expensive request path: each session spins up a
LiveKit room, a Python worker, and a live STT/LLM/TTS pipeline. The
`/api/interview/get-token` route (where LiveKit access tokens are minted) is
guarded by an Upstash Redis sliding-window limiter - **3 token requests per IP per
10 minutes** - checked before any auth/DB calls so abusive traffic is rejected
cheaply, returning `HTTP 429` with `Retry-After` / `X-RateLimit-*` headers.

This sits on top of an app-wide limiter in `src/proxy.ts` (20 requests / 10s per
user or IP across all `/api/*` routes).

## Source code notice

This repository contains the core architecture for a proprietary, closed-source
SaaS product. Local development and cloning instructions are intentionally omitted.

---
*Architected and developed by Sudarshan Kulkarni.*
