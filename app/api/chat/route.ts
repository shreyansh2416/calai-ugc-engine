import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';

// We are intentionally removing `export const runtime = 'edge';` 
// Node.js serverless functions have much more stable streaming buffers for external APIs.

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Strictly filter out any system messages and scrub hidden Next.js metadata
    const cleanMessages = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role,
        content: m.content
      }));

    // 2. Use the official Groq provider
    const result = await streamText({
      model: groq('llama3-8b-8192'),
      system: `You are a helpful AI assistant that generates UGC marketing videos.
      - If the user says hi, greet them naturally.
      - If the user asks what you do, say: "I can generate UGC videos! Just send me a product URL."
      - IF the user provides a product URL (like a website link), you MUST include this exact text somewhere in your response: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
      - Do not output the URL unless a product link is provided.`,
      messages: cleanMessages,
    });

    return result.toTextStreamResponse();
    
  } catch (error: any) {
    console.error("GROQ API CRASH:", error);
    return new Response(error.message || "Failed to fetch from Groq", { status: 500 });
  }
}