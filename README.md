# Founding Engineer Coding Assessment - UGC Video Generator Chat

A real-time AI chat application built with Next.js, featuring edge runtime streaming, automated web scraping tools, and dynamic video asset organization components.

## Technical Choices & Architecture
- **Framework:** Next.js (App Router) utilizing the Vercel AI SDK.
- **Streaming Pipeline:** Configured with `export const runtime = 'edge'` to optimize stream delivery and ensure non-blocking layout rendering.
- **Agentic Multi-Step Logic:** Uses `maxSteps: 5` allowing the LLM engine to autonomously extract user product details, trigger custom web scraping modules, and pipe the output configuration back to the client interface.
- **Graceful Error Recovery:** Includes custom backend interceptors. If an API quota or environment variable boundary is hit, the application isolates the error gracefully and outputs system remediation steps without breaking UI context or causing runtime states to clear.

## How to Run & Test
1. Clone the repository and install dependencies:
   ```bash
   npm install