export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    // Automatically detect your deployment URL (works for both localhost and Vercel)
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase() : "the product";

    const randomSeed = Math.floor(Math.random() * 100000);

    const systemPrompt = `You are an elite, highly creative UGC viral marketing director for TikTok and IG Reels. You have TWO distinct modes.

    MODE 1: CONVERSATION (If user says "hi" or asks a general question)
    - Answer naturally, conversationally, and accurately like ChatGPT.
    - DO NOT use hyphens instead of spaces. Use normal English formatting.
    - DO NOT pitch your video generation capabilities unless explicitly asked "what can you do?".

    MODE 2: VIDEO DIRECTION (If user provides a product URL or describes a specific app/service)
    - Analyze the product's actual value, competitive advantage, and utility.
    - Hook Rule 1: Include the exact brand name "${brand}" in the hook.
    - Hook Rule 2: BE ENDLESSLY CREATIVE. Write a completely unique, trendy TikTok caption every single time. Never repeat previous jokes. 
    - Hook Rule 3: POSITIVE "CHEAT CODE" HUMOR. Frame the user as a genius, a mastermind, or someone who unlocked a massive unfair advantage using the product. 
    - Hook Rule 4: NO CRINGE SLANG. Banned words: "rizz", "fr fr", "cooked", "nemesis". Keep it sharp, witty, and lowercase.
    - Hook Rule 5: Replace EVERY space in your final hook string with a single hyphen (-). 
    - gifCategory: CHOOSE EXACTLY ONE OF THESE TEN STRINGS ONLY: "drake", "rock", "shaq", "hart", "spongebob", "speed", "cena", "gordon", "elon", "ronaldo". (Use Random Seed ${randomSeed} to heavily vary your selection).
    - bgCategory: CHOOSE EXACTLY ONE OF THESE FIVE STRINGS ONLY: "gym", "kitchen", "bedroom", "office", "store". Match it logically to the chosen celebrity.
    
    OUTPUT STRUCTURE: You MUST output ONLY a valid JSON object matching this exact schema:
    {
      "intent": "chat" or "video",
      "chatResponse": "Normal English text response here",
      "videoBlueprint": {
        "hook": "hyphenated-witty-lowercase-success-caption",
        "bgCategory": "office",
        "gifCategory": "elon"
      }
    }`;

    let responseText = "";

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 1.2, // Maximum creative variance
          response_format: { type: "json_object" }, 
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({ role: m.role, content: m.content })).slice(-4)
          ]
        })
      });

      const data = await groqRes.json();
      const aiLogic = JSON.parse(data.choices[0].message.content);

      if (aiLogic.intent === "chat") {
        responseText = aiLogic.chatResponse;
      } else {
        const hook = aiLogic.videoBlueprint?.hook || `me-unlocking-genius-mode-with-${brand}`;
        const bgTerm = aiLogic.videoBlueprint?.bgCategory || "office";
        const gifTerm = aiLogic.videoBlueprint?.gifCategory || "elon";

        // DYNAMIC URL: This will now perfectly output your real Vercel URL in production and localhost during dev.
        const url = `${protocol}://${host}/video/${brand}?h=${hook}&b=${bgTerm}&g=${gifTerm}&t=${Date.now()}`;
        responseText = `I've analyzed the product and organized the creative assets. Check out the generated clip here:\n${url}`;
      }
    } catch (e) {
      console.error("Groq Engine Execution Error:", e);
      responseText = "I encountered a minor connection hiccup, but my creative direction engines are fully operational and ready to run!";
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode(words[i] + (i === words.length - 1 ? '' : ' ')));
          await new Promise(resolve => setTimeout(resolve, 20)); 
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });

  } catch (error: any) {
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}