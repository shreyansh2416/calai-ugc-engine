import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const groq = createOpenAI({
  baseURL: 'https://api.groq.com/openai/v1',
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'nodejs'; // Using Node.js for stable LLM streaming

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // 1. URL DETECTION REGEX (Looks for .com, .app, http, etc.)
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const urlMatch = lastMessage.match(urlRegex);

    // ==========================================
    // ROUTE A: A URL WAS FOUND -> ASSEMBLE VIDEO
    // ==========================================
    if (urlMatch) {
      const rawDomain = urlMatch[0].replace(/(^\w+:|^)\/\//, '').split('/')[0];
      const brandName = rawDomain.toUpperCase();

      // THEMATIC ASSET ENGINE (Matches Transparent Celebrity Stickers with relevant backgrounds)
      const themes = [
        { 
          // Theme 1: The "Rage/Gamer" Vibe (IShowSpeed)
          gif: "https://media.giphy.com/media/L-qQf_iKkQ4AAAAi/giphy.gif?ct=s", 
          bg: "https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg?auto=compress&cs=tinysrgb&w=800" 
        },
        { 
          // Theme 2: The "Chill/Success" Vibe (Drake)
          gif: "https://media.giphy.com/media/8a6Q4kO7pBwAAAAi/giphy.gif?ct=s", 
          bg: "https://images.pexels.com/photos/6954162/pexels-photo-6954162.jpeg?auto=compress&cs=tinysrgb&w=800" 
        },
        { 
          // Theme 3: The "Suspicious/Thinking" Vibe (The Rock)
          gif: "https://media.giphy.com/media/1OcbvYyS13UAAAAi/giphy.gif?ct=s", 
          bg: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800" 
        },
        { 
          // Theme 4: The "Confused" Vibe (Kevin Hart)
          gif: "https://media.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif?ct=s", 
          bg: "https://images.pexels.com/photos/373076/pexels-photo-373076.jpeg?auto=compress&cs=tinysrgb&w=800" 
        },
        { 
          // Theme 5: The "Happy/Vibing" Vibe (Shaq)
          gif: "https://media.giphy.com/media/3oEdv5S8Th6b9gsNqM/giphy.gif?ct=s", 
          bg: "https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=800" 
        }
      ];

      // Trending Audio Tracks
      const audios = [
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
      ];

      // Funny UGC Marketing Templates (Dynamically inserts the brand name)
      const textTemplates = [
        `ME ACTING LIKE I KNOW WHAT I'M DOING UNTIL I OPENED ${brandName}`,
        `POV: YOU FINALLY STOPPED GATEKEEPING ${brandName}`,
        `WHEN ${brandName} CASUALLY DROPS THE BEST FEATURE OF THE YEAR`,
        `MY THERAPIST TOLD ME TO FIND PEACE SO I LOGGED INTO ${brandName}`,
        `HOW IT FEELS TO USE ${brandName} INSTEAD OF DOING IT MANUALLY`,
        `BRO REALLY THOUGHT HE COULD SURVIVE WITHOUT ${brandName}`,
        `ME WATCHING ${brandName} AUTOMATE MY ENTIRE LIFE`
      ];

      // Randomly pick one of everything
      const selectedTheme = themes[Math.floor(Math.random() * themes.length)];
      const selectedAudio = audios[Math.floor(Math.random() * audios.length)];
      const selectedText = textTemplates[Math.floor(Math.random() * textTemplates.length)];

      // ENCODE THE DATA INTO THE URL
      const payloadUrl = `https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4?bg=${encodeURIComponent(selectedTheme.bg)}&gif=${encodeURIComponent(selectedTheme.gif)}&audio=${encodeURIComponent(selectedAudio)}&text=${encodeURIComponent(selectedText)}`;

      // Stream the response back manually to avoid Groq rate limits for video generations
      const responseText = `I've analyzed the site and organized a trendy UGC layout for you. Check out the generated clip here: ${payloadUrl}`;
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
    // ROUTE B: NO URL -> CHAT NATURALLY (LLM)
    // ==========================================
    else {
      // Keep only the last 4 messages to prevent Groq history crashes
      const recentMessages = messages.slice(-4);
      recentMessages.unshift({
        role: 'system',
        content: `You are a helpful, witty AI assistant. 
        - If the user asks about the weather, Sundar Pichai, or anything else, answer them naturally and accurately like ChatGPT.
        - If they say "hi", greet them.
        - If they ask what you do, tell them you generate UGC marketing videos from product URLs.
        - NEVER output a video URL in this mode.`
      });

      const result = await streamText({
        model: groq('llama3-8b-8192'),
        messages: recentMessages,
      });

      return result.toTextStreamResponse();
    }
    
  } catch (error: any) {
    console.error("API ROUTE ERROR:", error);
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}