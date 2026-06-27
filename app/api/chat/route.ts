export const runtime = 'edge';

async function fetchSiteMetadata(url: string): Promise<string> {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(targetUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(2500) 
    });
    
    const html = await response.text();
    const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                  html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
                  
    return match && match[1] ? match[1].trim() : "";
  } catch (e) {
    return "";
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    const urlRegex = /(https?:\/\/[^\s]+|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
    const match = lastMsg.match(urlRegex);
    
    let brand = "the product";
    let crawledContext = "No live crawling data available.";
    
    if (match) {
      const fullUrl = match[0];
      brand = fullUrl.replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase();
      const siteDescription = await fetchSiteMetadata(fullUrl);
      if (siteDescription) {
        crawledContext = `CRAWLED DESCRIPTION FROM ${brand}: "${siteDescription}"`;
      }
    }

    // This array holds 10 completely distinct trending TikTok concepts
    const memeFormats = [
      `"the urge to drop everything and completely obsess over ${brand}"`,
      `"my FBI agent watching me spend another 4 hours on ${brand}"`,
      `"my top 5 horror movies: number 1, living without ${brand}"`,
      `"me trying to explain to my friends why ${brand} is the greatest thing ever"`,
      `"when someone asks how I did it so fast and my secret is just ${brand}"`,
      `"my bank account watching me ignore it completely to use ${brand}"`,
      `"how it feels to absolutely master ${brand}"`,
      `"when they say you should balance your expenses but ${brand} exists"`,
      `"POV: your attention span is cooked so you open ${brand} instead"`,
      `"me acting like an absolute academic weapon because I use ${brand}"`
    ];

    // Select ONE specific meme format mathematically to force the AI into variety
    const randomSeed = Math.floor(Math.random() * 100000);
    const forcedMeme = memeFormats[randomSeed % memeFormats.length];

    const systemPrompt = `You are an elite UGC viral marketing director. 

    MODE 1: CONVERSATION 
    - Answer naturally, concisely, and accurately.

    MODE 2: VIDEO DIRECTION (If user provides a product URL)
    - Analyze the brand name, and review this crawled context from their live site: ${crawledContext}
    - Hook Rule 1: You MUST write your caption based EXACTLY on this trending meme format: ${forcedMeme}
    - Hook Rule 2: Adapt the format slightly to match the product's actual use case (e.g. tracking calories, watching videos, buying shoes) but DO NOT lose the comedic punchline.
    - Hook Rule 3: Replace EVERY space in your final hook string with a single hyphen (-). Keep it entirely lowercase.
    - gifCategory: CHOOSE EXACTLY ONE: "drake", "rock", "shaq", "hart", "spongebob", "speed", "cena", "gordon", "elon", "ronaldo". (Use Random Seed ${randomSeed} to shuffle your selection).
    - bgCategory: CHOOSE EXACTLY ONE: "gym", "kitchen", "bedroom", "office", "store". Match it logically to the product domain.
    
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
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          temperature: 0.9, 
          response_format: { type: "json_object" }, 
          messages: [{ role: 'system', content: systemPrompt }, ...messages.slice(-4)]
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
        responseText = `I've crawled the site content, analyzed the metadata, and organized the creative assets. Check out the generated clip here:\n${url}`;
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