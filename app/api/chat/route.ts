import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateText } from 'ai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'nodejs';

// NEW, CURRENTLY SUPPORTED GROQ MODEL
const MODEL_NAME = 'llama-3.3-70b-versatile'; 

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const cleanMessages = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({ role: m.role, content: m.content }));

    const lastMessage = cleanMessages[cleanMessages.length - 1].content.toLowerCase();
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const urlMatch = lastMessage.match(urlRegex);

    // ==========================================
    // ROUTE A: UGC GENERATION (Infinite AI Logic)
    // ==========================================
    if (urlMatch) {
      const rawDomain = urlMatch[0].replace(/(^\w+:|^)\/\//, '').split('/')[0];
      const brandName = rawDomain.toUpperCase();
      
      // Ironclad Randomized Fallbacks (In case AI hallucinates or API fails)
      const fallbacks = [
        { hook: `BRO I WAS MANUALLY DOING THIS UNTIL ${brandName} 💀`, celeb: "IShowSpeed", bgPrompt: "dark rgb gaming room" },
        { hook: `WHEN THEY ASK HOW I DID IT SO FAST BUT MY SECRET IS ${brandName} 🤫`, celeb: "The Rock", bgPrompt: "luxury modern gym locker" },
        { hook: `MY ACTUAL REACTION WHEN ${brandName} DROPS THE HARDEST UPDATE 🕺🔥`, celeb: "Shaq", bgPrompt: "modern luxury kitchen" },
        { hook: `ME WATCHING EVERYONE STRUGGLE WHILE I JUST USE ${brandName} 🍷🗿`, celeb: "Drake", bgPrompt: "luxury podcast studio" },
        { hook: `HOW IT FEELS TO SURVIVE WITHOUT USING ${brandName} 😭`, celeb: "Kevin Hart", bgPrompt: "messy office desk" }
      ];
      
      let ugcData = fallbacks[Math.floor(Math.random() * fallbacks.length)];

      try {
        // Call Groq to dynamically write the marketing hook
        const aiDirector = await generateText({
          model: groq(MODEL_NAME),
          system: `You are an elite, unhinged Gen-Z marketing director in 2026. The user is providing a product URL. 
          Output ONLY a raw JSON object (no markdown, no text) with these exact keys:
          - "hook": A very funny, trendy, clever TikTok-style text overlay hook about the product (max 12 words).
          - "celeb": The exact name of a massively hyped, trending celebrity (e.g., IShowSpeed, Drake, The Rock, Shaq, Kevin Hart).
          - "bgPrompt": A 4-word visual description of a realistic room/background that matches the vibe (e.g., "dark neon gaming room").`,
          prompt: `Write the UGC metadata for this product: ${brandName}`
        });

        const jsonString = aiDirector.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(jsonString);
        if (parsed.hook && parsed.celeb && parsed.bgPrompt) {
            ugcData = parsed;
        }
      } catch (e) { 
        console.error("Groq JSON parsing failed, using randomized fallback."); 
      }

      // Pack the AI's choices into a safe URL
      const payloadUrl = `https://ugc-engine.app/render/${brandName}?hook=${encodeURIComponent(ugcData.hook)}&celeb=${encodeURIComponent(ugcData.celeb)}&bg=${encodeURIComponent(ugcData.bgPrompt)}`;
      const responseText = `I've analyzed the site and organized a custom UGC layout for you. Check out the generated clip here: ${payloadUrl}`;
      
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
    
    // ==========================================
    // ROUTE B: NATURAL SMALL TALK
    // ==========================================
    else {
      const result = await streamText({
        model: groq(MODEL_NAME),
        system: `You are a helpful, witty AI assistant. 
        - If the user asks general questions, answer them accurately and naturally like ChatGPT.
        - If they say "hi", greet them naturally.
        - If they ask what you do, tell them you generate UGC marketing videos from product URLs.
        - NEVER output a video URL in this mode. Keep answers concise.`,
        messages: cleanMessages,
      });
      return result.toTextStreamResponse();
    }
  } catch (error: any) {
    console.error("API ROUTE ERROR:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}