export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    // Extract the brand/domain cleanly from the user's message
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase() : "the product";

    // Injecting randomness on every single request to disrupt deterministic LLM repetition loops
    const randomSeed = Math.floor(Math.random() * 100000);

    const systemPrompt = `You are an elite, highly creative UGC (User Generated Content) viral marketing director for TikTok and IG Reels. You have TWO distinct modes.

    MODE 1: CONVERSATION (If user says "hi", greets you, or asks a general question)
    - Answer naturally, conversationally, and accurately like ChatGPT.
    - DO NOT use hyphens instead of spaces. Use normal English formatting.
    - DO NOT pitch your video generation capabilities unless explicitly asked "what can you do?".

    MODE 2: VIDEO DIRECTION (If user provides a product URL or describes a specific app/service)
    - Analyze the product's actual value, competitive advantage, and utility.
    - Hook Rule 1: You MUST include the exact brand name or URL string "${brand}" inside the hook text.
    - Hook Rule 2: POSITIVE "CHEAT CODE / GALAXY BRAIN" HUMOR. Write a clever, trendy TikTok caption about succeeding, outsmarting a system, feeling like a genius, or having a massive unfair advantage because of this product.
    - Hook Rule 3: ABSOLUTELY NO SELF-DEPRECATING OR LAZY JOKES. Do not make the user sound foolish, lazy, or incompetent. (Examples: "me unlocking 100% of my brain power using ${brand}", "my competitors wondering how i grew so fast but my secret is just ${brand}").
    - Hook Rule 4: ABSOLUTELY NO CRINGE OVERUSED SLANG. Banned words: "rizz", "fr fr", "cooked", "nemesis", "no cap", "mewing", "aura". Keep it universally sharp, witty, and highly shareable.
    - Hook Rule 5: Replace EVERY space in your final hook string with a single hyphen (-). Ensure it is completely lowercase.
    - gifCategory: YOU MUST CHOOSE EXACTLY ONE OF THESE TEN STRINGS ONLY. DO NOT CREATE NEW ONES: "drake", "rock", "shaq", "hart", "spongebob", "speed", "cena", "gordon", "elon", "ronaldo". (Use Random Seed ${randomSeed} to heavily vary your selection across generations).
    - bgCategory: YOU MUST CHOOSE EXACTLY ONE OF THESE FIVE STRINGS ONLY. DO NOT CREATE NEW ONES: "gym", "kitchen", "bedroom", "office", "store".
    - VISUAL COHESION MANDATE: The chosen bgCategory MUST strictly and logically match the context of the chosen celebrity gifCategory. For example:
        * "gordon" -> MUST use "kitchen"
        * "ronaldo", "rock", "cena" -> MUST use "gym"
        * "elon", "drake" -> MUST use "office" or "bedroom"
    
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
          temperature: 1.15, // Raised temperature slightly to maximize creative divergence
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

        // Generate a production-ready absolute URL configuration.
        // TIP: When deploying live, you can swap "http://localhost:3000" with your actual custom Vercel domain string.
        const url = `http://localhost:3000/video/${brand}?h=${hook}&b=${bgTerm}&g=${gifTerm}&t=${Date.now()}`;
        responseText = `I've analyzed the product and organized the creative assets. Check out the generated clip here:\n${url}`;
      }
    } catch (e) {
      console.error("Groq Engine Execution Error:", e);
      responseText = "I encountered a minor connection hiccup, but my creative direction engines are fully operational and ready to run!";
    }

    // High-performance word-by-word streaming pipeline to mimic smooth live human typing
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