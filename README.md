# Column8 🚀

**An AI-Powered Resume Builder SaaS**

Column8 is a production-grade Software-as-a-Service (SaaS) platform that leverages artificial intelligence to help users generate, format, and optimize professional resumes. Built with a focus on performance, real-time data handling, and seamless user experience.

🔗 **Live Application:** https://column8.io/

---

## 🏗 Architecture & Tech Stack

This application is architected for scalability, utilizing modern server-side rendering and edge computing to handle AI streaming and document generation.

* **Core Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Deployment & Infrastructure:** Vercel

## ✨ Core Product Features

* **AI-Driven Content Generation:** Context-aware bullet point generation and optimization using LLM integration.
* **Real-Time Preview Engine:** Instant, zero-latency visual updates as the user edits their document data.
* **High-Fidelity Document Export:** Pixel-perfect PDF rendering ensuring exact matches between the web preview and the final downloaded resume.
* **Responsive Architecture:** Fully optimized for both desktop web and mobile viewing experiences.

## 🛡️ FinOps & DDoS Protection

Voice interviews are the most expensive request path in the app - each session spins up a LiveKit room, a Python worker (`agent.py`), and a live LLM/STT pipeline. To stop bots or abusive clients from draining cloud credits, the `/api/interview/get-token` route (where LiveKit access tokens are minted) is protected by an **Upstash Redis sliding-window rate limiter** (`@upstash/ratelimit` + `@upstash/redis`):

* **Limit:** 3 token requests per IP address per 10-minute window.
* **Enforcement point:** checked first, before any Supabase/auth calls, so abusive traffic is rejected as cheaply as possible.
* **Response:** exceeding the limit returns `HTTP 429` with `Retry-After` / `X-RateLimit-*` headers so well-behaved clients can back off correctly.

This sits on top of a broader, app-wide rate limiter in `middleware.ts` (20 requests / 10s per user or IP across all `/api/*` routes), giving the voice pipeline a much tighter, purpose-specific cap.

## 🔒 Source Code Notice

**This repository contains the core architecture for a proprietary, closed-source SaaS product.** Unlike open-source projects or boilerplate templates, this codebase is strictly for production deployment and architectural demonstration. As such, local development/cloning instructions have been omitted.

---
*Architected and developed by Sudarshan Kulkarni*
