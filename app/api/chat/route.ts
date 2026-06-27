export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    const brand = match ? match[0].replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase() : "the product";

    // We use JS to force the AI to use a different meme format every single time
    const memeFormats = [
      `"POV: you finally started using ${brand}"`,
      `"my FBI agent watching me obsessed with ${brand}"`,
      `"me explaining to everyone why ${brand} is the best"`,
      `"the urge to drop everything and use ${brand}"`,
      `"how it feels to master ${brand}"`,
      `"my bank account watching me buy more from ${brand}"`,
      `"when someone asks how I did it so fast and my secret is ${brand}"`,
      `"me acting like a genius because I use ${brand}"`
    ];
    const randomSeed = Math.floor(Math.random() * 100000);
    const forcedMeme = memeFormats[randomSeed % memeFormats.length];

    const systemPrompt = `You are an elite UGC viral marketing director.

    MODE 1: CONVERSATION 
    - Answer naturally and accurately. DO NOT pitch video generation unless asked.

    MODE 2: VIDEO DIRECTION (If user provides a product URL)
    - Analyze the product.
    - Hook Rule 1: You MUST write your hook based on this exact meme format: ${forcedMeme}
    - Hook Rule 2: Adapt that format slightly to match the product's actual use case (e.g. tracking calories, watching videos, buying shoes). Keep it funny and relatable.
    - Hook Rule 3: Replace EVERY space in your final hook string with a single hyphen (-). Keep it entirely lowercase.
    - gifCategory: CHOOSE EXACTLY ONE: "drake", "rock", "shaq", "hart", "spongebob", "speed", "cena", "gordon", "elon", "ronaldo". (Use Random Seed ${randomSeed} to heavily vary your selection).
    - bgCategory: CHOOSE EXACTLY ONE: "gym", "kitchen", "bedroom", "office", "store". Match it logically to the chosen celebrity and product.
    
    OUTPUT STRUCTURE: You MUST output ONLY a valid JSON object matching this schema:
    {
      "intent": "chat" or "video",
      "chatResponse": "Normal English text",
      "videoBlueprint": {
        "hook": "hyphenated-witty-lowercase-caption",
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
          temperature: 0.9, 
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
        const hook = aiLogic.videoBlueprint?.hook || `using-${brand}-like-a-pro`;
        const bgTerm = aiLogic.videoBlueprint?.bgCategory || "office";
        const gifTerm = aiLogic.videoBlueprint?.gifCategory || "elon";

        const url = `${protocol}://${host}/video/${brand}?h=${hook}&b=${bgTerm}&g=${gifTerm}&t=${Date.now()}`;
        responseText = `I've analyzed the product and organized the creative assets. Check out the generated clip here:\n${url}`;
      }
    } catch (e) {
      console.error("Groq Engine Error:", e);
      responseText = "I encountered a minor connection hiccup, but my creative engines are ready!";
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