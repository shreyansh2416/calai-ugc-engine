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

    // THE FIX: Scrub the messages to remove Next.js metadata (id, createdAt) 
    // so Groq's strict API does not crash on the second turn.
    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const result = await streamText({
      // Switched to 8b-instant to prevent rate-limiting freezes and ensure fast streaming
      model: groq('llama-3.1-8b-instant'),
      system: `You are a helpful, clever, and friendly AI assistant that generates UGC (User-Generated Content) marketing videos.

      Follow these strict conversational rules:
      1. If the user just says "hi" or greets you, greet them back naturally and enthusiastically.
      2. If the user asks "What can you do?" or asks about your capabilities, respond with something like: "I can generate UGC videos for you! Just send me a product URL and I'll create an engaging short-form marketing video."
      3. IF AND ONLY IF the user provides a product URL (like a website link) or explicitly asks to generate a video for a product:
         - Acknowledge the product.
         - Tell them you are organizing the assets and assembling the layers.
         - You MUST include this exact trigger URL in your response so the system can render the video player: https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4

      Keep your responses concise, natural, and highly relevant to social media marketing. Do NOT include the video URL in regular conversation unless a product link was provided.`,
      messages: cleanMessages,
    });

    return result.toTextStreamResponse();
    
  } catch (error: any) {
    console.error("API ROUTE ERROR:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}