# 🎬 AI UGC Video Ad Engine

A high-performance, edge-rendered chat interface that intelligently parses product URLs, extracts website metadata, and orchestrates dynamic, multi-layered User Generated Content (UGC) marketing videos natively inside the browser.

## 🚀 Live Demo
👉 **https://calai-ugc-engine.vercel.app/**

## 🧠 Core Features & Architectural Decoupling

* **Serverless Edge Metadata Scraping:** When a user passes a URL, an inline Edge-safe HTML scanner dynamically extracts Open Graph (`og:description`) and document headers. This feeds granular, live context directly into the LLM logic, enabling hyper-relevant marketing captions.
* **Deterministic Visual Variety Engine:** To bypass standard LLM randomness limits (where models tend to repeat asset choices), asset pairing is handled mathematically via JavaScript runtime distributions. This completely mitigates deterministic repetition.
* **Auto-Healing Asset Fallback Pipeline:** Relying on standard image CDNs opens up third-party IP rate-limiting. This engine utilizes an active `onError` listener wrapper—instantly swapping downstream CDNs (switching to optimized Picsum vertical seeds) or falling back to a custom CSS frame to guarantee an uninterrupted user layout.
* **Full-Bleed Responsive Player Architecture:** Videos are dynamically formatted server-side using aspect cropping tags (`&fit=crop&w=400&h=800`) to completely remove horizontal and vertical letterboxing (black bars), producing clean native 9:16 mobile canvas clips.
* **Standalone Micro-Routing:** Video links generated within the chat context are completely decoupled from the chat layout, executing natively within dedicated sub-routes (`/video/[brand]`) using real-time parameter tracking.

## 🛠️ Technology Stack
* **Framework:** Next.js (App Router Ecosystem)
* **Hosting/Runtime:** Vercel Edge Network
* **Styling:** Tailwind CSS 
* **AI Orchestration:** Groq Cloud Inference (`llama-3.3-70b-versatile`)
