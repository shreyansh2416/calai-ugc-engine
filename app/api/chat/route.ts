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

    const validMessages = messages.filter((m: any) => m.content && m.content.trim() !== '');

    const result = await streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: `You are an autonomous UGC video generation agent. 
      The user is asking you to scrape a URL and generate a video. 
      Assume the scraping and generation were successful behind the scenes.
      You MUST reply to the user with a friendly, short message that includes this EXACT video URL:
      https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`,
      messages: validMessages,
    });

    return result.toTextStreamResponse();
    
  } catch (error: any) {
    console.error("API ROUTE ERROR:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}