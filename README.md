# 🎬 AI UGC Video Ad Engine

A high-performance, edge-rendered chat interface that intelligently parses product URLs, extracts website metadata, and orchestrates dynamic, multi-layered User Generated Content (UGC) marketing videos natively inside the browser.

## 🚀 Live Demo
👉 **https://calai-ugc-engine.vercel.app/**

## 🧠 Core Features & Architectural Decoupling

* **Zero-Cache Identity (LLM Entropy):** Standard LLMs are notoriously deterministic, and Next.js aggressively caches routes. This engine bypasses both by forcing dynamic serverless edge headers and injecting algorithmic entropy into the system prompt. This guarantees unique, non-repetitive social media archetypes even on identical sequential requests.
* **Context-Aware Visual Hybridization:** The generation sequence operates on a hybrid logic layer. The LLM handles site crawling and intelligently matches background categories based on product context (e.g., tech yields office environments, fitness yields gyms). Meanwhile, the client runtime enforces strict asset distribution for the foreground characters, ensuring visual combinations always stay highly varied.
* **Resilient Media Architecture (Self-Healing):** Relying on standard image CDNs introduces third-party IP rate-limiting risks. This engine utilizes an active `onError` listener wrapper that instantly hot-swaps downstream CDNs (falling back to optimized vertical seeds) to guarantee an uninterrupted user layout if an asset fails to load.
* **DOM Stability & Native Formats:** Global style injections that trigger browser layout thrashing (flickering) were stripped in favor of performant inline properties. Videos are dynamically formatted server-side using aspect cropping tags (`&fit=crop&w=400&h=800`) to enforce native 9:16 mobile canvas ratios with zero letterboxing.
* **Standalone Micro-Routing:** Video links generated within the chat context are completely decoupled from the chat layout, executing natively within dedicated sub-routes (`/video/[brand]`) using real-time parameter tracking.

## 🛠️ Technology Stack
* **Framework:** Next.js (App Router Ecosystem)
* **Hosting/Runtime:** Vercel Edge Network
* **Styling:** Tailwind CSS 
* **AI Orchestration:** Groq Cloud Inference (`llama-3.3-70b-versatile`)

## ⚙️ Local Development Environment

1. Clone the repository and install dependencies:
   ```bash
   npm install