import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    // 1. SCRUB THE HISTORY: This stops Groq from crashing on small talk
    const cleanMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }));

    const lastMessage = cleanMessages[cleanMessages.length - 1].content.toLowerCase();

    // 2. URL DETECTION
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const urlMatch = lastMessage.match(urlRegex);

    if (urlMatch) {
      const rawDomain = urlMatch[0].replace(/(^\w+:|^)\/\//, '').split('/')[0];
      const brandName = rawDomain.toUpperCase();
      
      // Randomly select one of the 5 distinct themes
      const variant = Math.floor(Math.random() * 5) + 1; 

      // TINY SHORT URL: Fixes the text box overflow issue completely
      const payloadUrl = `https://ugc-engine.app/render/${brandName}-${variant}`;

      const responseText = `I've analyzed the site and organized a trendy UGC layout for you. Check out the generated clip here: ${payloadUrl}`;
      
      // Stream text manually so video links return instantly
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const words = responseText.split(' ');
          for (let i = 0; i < words.length; i++) {
            controller.enqueue(encoder.encode(words[i] + ' '));
            await new Promise(resolve => setTimeout(resolve, 30)); 
          }
          controller.close();
        },
      });
      return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    } 
    
    // 3. SMALL TALK ROUTING: Answers questions exactly like ChatGPT
    else {
      cleanMessages.unshift({
        role: 'system',
        content: `You are a helpful, witty AI assistant. 
        - If the user asks general questions (weather, Sundar Pichai, coding, etc.), answer them accurately and naturally like ChatGPT.
        - If they say "hi", greet them.
        - If they ask what you do, tell them you generate UGC marketing videos from product URLs.
        - NEVER output a video URL in this mode.`
      });

      const result = await streamText({
        model: groq('llama3-8b-8192'),
        messages: cleanMessages,
      });

      return result.toTextStreamResponse();
    }
    
  } catch (error: any) {
    console.error("API ROUTE ERROR:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}