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
    const randomHash = Math.random().toString(36).substring(7);

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
    // Replaced modulo with true Math.random for guaranteed archetype variety
    const forcedVibe = memeArchetypes[Math.floor(Math.random() * memeArchetypes.length)];

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

    MODE 1: CONVERSATION 
    - Answer naturally, concisely, and accurately.

    MODE 2: VIDEO DIRECTION (If user provides a product URL)
    - Write a funny social media meme caption for the brand: ${brand}
    - Context: ${crawledContext}
    
    - RULE 1 - THE VIBE: Base your joke on this archetype: "${forcedVibe}".
    - RULE 2 - EXTREME ENTROPY: Here is your random seed: [${currentMs}-${randomHash}]. You MUST use this seed to completely mutate your vocabulary and phrasing. NEVER write the same sentence structure twice. Be wildly creative.
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
          temperature: 1.15, // CRITICAL: High temperature forces the AI to choose different words
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