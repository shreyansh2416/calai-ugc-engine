export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function fetchSiteMetadata(url: string): Promise<string> {
  try {
    const targetUrl = url.startsWith('http') ? url : `https://${url}`;
    const response = await fetch(targetUrl, { 
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      signal: AbortSignal.timeout(2500) 
    });
    
    const html = await response.text();
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                      html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i);
    
    if (descMatch && descMatch[1]) return descMatch[1].trim();

    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch && titleMatch[1] ? `Website Title: ${titleMatch[1].trim()}` : "";
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
    let crawledContext = "No specific data found. Assume it's a general web app.";
    
    if (match) {
      const fullUrl = match[0];
      brand = fullUrl.replace(/(^\w+:|^)\/\//, '').split('/')[0].toLowerCase();
      const siteDescription = await fetchSiteMetadata(fullUrl);
      if (siteDescription) {
        crawledContext = `Live Site Context: "${siteDescription}"`;
      }
    }

    const currentMs = Date.now();

    // UPGRADE: Universal Social Media Archetypes instead of just TikTok
    const memeArchetypes = [
      "The relatable late-night thought",
      "The 'Nobody: / Me:' format",
      "The 'How it started vs. How it is going' vibe",
      "The unspoken rule of using this product",
      "The highly specific targeted ad feeling",
      "The unexpected life hack",
      "The product review no one asked for but everyone needs",
      "The 'Me vs. Also Me' internal struggle"
    ];
    const forcedVibe = memeArchetypes[currentMs % memeArchetypes.length];

    const visualPairs = [
      { g: "drake", b: "bedroom" },
      { g: "drake", b: "store" },
      { g: "rock", b: "gym" },
      { g: "cena", b: "gym" },
      { g: "ronaldo", b: "gym" },
      { g: "shaq", b: "store" },
      { g: "gordon", b: "kitchen" },
      { g: "elon", b: "office" },
      { g: "hart", b: "store" },
      { g: "spongebob", b: "bedroom" },
      { g: "speed", b: "bedroom" }
    ];
    const forcedVisuals = visualPairs[Math.floor(Math.random() * visualPairs.length)];

    const systemPrompt = `You are an elite, highly intelligent UGC viral marketing director. 
    CURRENT TIMESTAMP: ${currentMs}

    MODE 1: CONVERSATION 
    - Answer naturally, concisely, and accurately.

    MODE 2: VIDEO DIRECTION (If user provides a product URL)
    - You must write a funny social media meme caption for the brand: ${brand}
    - Read what the brand actually does here: ${crawledContext}
    
    - RULE 1 - THE VIBE: Base your joke on this specific universal social media archetype: "${forcedVibe}".
    - RULE 2 - COHERENCE OVER EVERYTHING: The joke MUST actually make sense for what the product does. Avoid repeating the same joke structure.
    - RULE 3 - FORMATTING: Replace EVERY space in your final hook string with a single hyphen (-). Keep it entirely lowercase. Do not use punctuation.
    
    OUTPUT STRUCTURE: You MUST output ONLY a valid JSON object matching this schema:
    {
      "intent": "chat" or "video",
      "chatResponse": "Normal English text",
      "videoBlueprint": {
        "hook": "hyphenated-witty-lowercase-caption"
      }
    }`;

    let responseText = "";

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        cache: 'no-store', 
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
        const hook = aiLogic.videoBlueprint?.hook || `using-${brand}-every-single-day`;
        const url = `${protocol}://${host}/video/${brand}?h=${hook}&b=${forcedVisuals.b}&g=${forcedVisuals.g}&t=${currentMs}`;
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

    return new Response(stream, { 
      headers: { 
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate' 
      } 
    });

  } catch (error: any) {
    return new Response(error.message || "Internal Server Error", { status: 500 });
  }
}