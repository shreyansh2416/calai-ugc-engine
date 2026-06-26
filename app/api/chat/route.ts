import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // 1. Strictly map the history so Groq doesn't choke on Next.js hidden metadata
    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    // 2. Inject the system instructions directly into the message array
    // This bypasses Groq's system parameter bug entirely.
    cleanMessages.unshift({
      role: 'system',
      content: `You are a helpful AI assistant that generates UGC marketing videos.
      - If the user says hi, greet them naturally.
      - If the user asks what you do, say: "I can generate UGC videos! Just send me a product URL."
      - IF the user provides a product URL (like a website link), you MUST include this exact text somewhere in your response: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
      - Do not output the URL unless a product link is provided.`
    });

    const result = await streamText({
      model: groq('llama-3.1-8b-instant'),
      messages: cleanMessages,
    });

    return result.toTextStreamResponse();
    
  } catch (error: any) {
    // This will print the exact error reason in your Vercel logs if it fails again
    console.error("GROQ API CRASH:", error);
    return new Response(error.message || "Failed to fetch from Groq", { status: 500 });
  }
}